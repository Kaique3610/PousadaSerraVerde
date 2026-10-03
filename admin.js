'use strict';

// Browser-only prototype: examples plus bookings saved by the public site.
const REFERENCE_DATE = '2026-10-03';
const activities = {
    horse: { title: 'Cavalgada ao Pôr do Sol', capacity: 8, icon: 'ph-horse' },
    boat: { title: 'Passeio de Lancha VIP', capacity: 6, icon: 'ph-anchor' },
    dayuse: { title: 'Day-Use Serra Verde', capacity: 20, icon: 'ph-sun' }
};
const demoReservations = [
    { id:'SV-1012', name:'Mariana Costa', tour:'horse', date:'2026-10-04', time:'16:30', adults:2, children:1, total:240, status:'Pendente', payment:'Pendente', note:'Primeira experiência com cavalgada.' },
    { id:'SV-1011', name:'Rafael Almeida', tour:'boat', date:'2026-10-04', time:'11:00', adults:4, children:0, total:1000, status:'Confirmada', payment:'Pago', note:'Grupo de amigos.' },
    { id:'SV-1010', name:'Camila Ribeiro', tour:'dayuse', date:REFERENCE_DATE, time:'08:00', adults:2, children:2, total:100, status:'Confirmada', payment:'Pago', note:'Visita em família.' },
    { id:'SV-1009', name:'Pedro Santos', tour:'horse', date:REFERENCE_DATE, time:'16:30', adults:3, children:0, total:270, status:'Confirmada', payment:'Pago', note:'Chegar 15 minutos antes da saída.' },
    { id:'SV-1008', name:'Juliana Oliveira', tour:'boat', date:REFERENCE_DATE, time:'14:00', adults:2, children:1, total:650, status:'Confirmada', payment:'Pendente', note:'Pagamento aguardando confirmação da equipe.' },
    { id:'SV-1007', name:'Lucas Ferreira', tour:'horse', date:REFERENCE_DATE, time:'16:30', adults:2, children:1, total:240, status:'Confirmada', payment:'Pago', note:'Solicitou orientações sobre roupas adequadas.' },
    { id:'SV-1006', name:'Beatriz Lima', tour:'dayuse', date:REFERENCE_DATE, time:'08:00', adults:4, children:0, total:200, status:'Pendente', payment:'Pendente', note:'Aguardando confirmação da visita.' },
    { id:'SV-1005', name:'André Martins', tour:'boat', date:REFERENCE_DATE, time:'11:00', adults:4, children:0, total:1000, status:'Confirmada', payment:'Pago', note:'Passeio com parada para banho.' },
    { id:'SV-1004', name:'Fernanda Rocha', tour:'dayuse', date:'2026-10-04', time:'08:00', adults:3, children:1, total:150, status:'Confirmada', payment:'Pago', note:'Visita com uma criança.' },
    { id:'SV-1003', name:'Bruno Carvalho', tour:'boat', date:REFERENCE_DATE, time:'14:00', adults:2, children:0, total:500, status:'Cancelada', payment:'Não cobrado', note:'Cancelamento solicitado pelo visitante.' },
    { id:'SV-1002', name:'Ana Pereira', tour:'horse', date:'2026-10-02', time:'16:30', adults:2, children:0, total:180, status:'Concluída', payment:'Pago', note:'Experiência realizada.' },
    { id:'SV-1001', name:'Gabriel Souza', tour:'dayuse', date:'2026-10-02', time:'08:00', adults:2, children:1, total:100, status:'Concluída', payment:'Pago', note:'Visita realizada.' }
];
let reservations = [];
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[character]));
function loadReservations() {
    const local = window.PrototypeReservations.read().map((r, index) => {
        const tour = Object.hasOwn(activities, r.tourId) ? r.tourId : Object.keys(activities).find(id => activities[id].title === r.tour);
        const date = window.PrototypeReservations.toISODate(r.dateISO || r.date);
        if (!tour || !date) return null;
        return {
            id: String(r.id || `local-${index}`), name: String(r.name || 'Visitante do protótipo'), tour, date,
            time: String(r.time || 'A combinar'), adults: Math.max(0,Number(r.adults) || 0), children: Math.max(0,Number(r.children) || 0),
            total: Number(r.total) || 0, status: ['Confirmada','Pendente','Cancelada','Concluída'].includes(r.status) ? r.status : 'Pendente',
            payment: 'Pendente', phone: String(r.phone || ''), participants: Array.isArray(r.participants) ? r.participants : [],
            source: 'site', note: 'Reserva criada no protótipo pelo site. O pagamento não foi processado.', createdAt: String(r.createdAt || '')
        };
    }).filter(Boolean).sort((a,b) => b.createdAt.localeCompare(a.createdAt));
    reservations = [...local, ...demoReservations];
}
let currentView = 'overview';
const currency = value => value.toLocaleString('pt-BR', { style:'currency', currency:'BRL' });
const displayDate = value => new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit' });
const pax = reservation => reservation.adults + reservation.children;
const badgeClasses = { Confirmada:'confirmed', Pendente:'pending', Cancelada:'cancelled', Concluída:'completed', Pago:'paid', 'Não cobrado':'completed' };
const badge = status => `<span class="badge badge-${badgeClasses[status]}">${status}</span>`;
const detailsButton = reservation => `<button class="icon-button" data-reservation="${escapeHTML(reservation.id)}" aria-label="Ver detalhes da reserva ${escapeHTML(reservation.id)} de ${escapeHTML(reservation.name)}"><i class="ph ph-arrow-up-right" aria-hidden="true"></i></button>`;

function renderTable(items) {
    if (!items.length) return emptyState();
    return `<div class="table-scroll"><table><thead><tr><th scope="col">Visitante</th><th scope="col">Passeio</th><th scope="col">Data / horário</th><th scope="col">Pessoas</th><th scope="col">Reserva</th><th scope="col">Pagamento</th><th scope="col">Valor</th><th scope="col"><span class="sr-only">Detalhes</span></th></tr></thead><tbody>${items.map(r => `<tr><td><strong>${escapeHTML(r.name)}</strong><small>${escapeHTML(r.id)} · ${r.source === 'site' ? 'Criada no site' : 'Exemplo fictício'}</small></td><td>${activities[r.tour].title}</td><td>${displayDate(r.date)} · ${r.tour === 'dayuse' ? '08h às 18h' : r.time}</td><td>${pax(r)}</td><td>${badge(r.status)}</td><td>${badge(r.payment)}</td><td>${currency(r.total)}</td><td>${detailsButton(r)}</td></tr>`).join('')}</tbody></table></div>`;
}
function emptyState() {
    return '<div class="empty-state"><i class="ph ph-calendar-x" aria-hidden="true"></i><strong>Nenhuma reserva encontrada</strong><p>Escolha outra data ou ajuste os filtros para consultar os passeios.</p></div>';
}
function groupByDeparture(items) {
    const groups = new Map();
    [...items].sort((a,b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)).forEach(r => {
        const key = `${r.date}-${escapeHTML(r.time)}-${r.tour}`;
        if (!groups.has(key)) groups.set(key, { date:r.date, time:r.time, tour:r.tour, items:[] });
        groups.get(key).items.push(r);
    });
    return [...groups.values()];
}
function renderOverview() {
    const today = reservations.filter(r => r.date === REFERENCE_DATE && r.status !== 'Cancelada');
    const confirmed = today.filter(r => r.status === 'Confirmada');
    const pendingPayment = reservations.filter(r => r.payment === 'Pendente' && r.status !== 'Cancelada');
    const metrics = [
        ['Reservas de hoje', today.length, 'Confirmadas e pendentes', 'ph-ticket'],
        ['Participantes previstos', confirmed.reduce((sum,r) => sum+pax(r),0), 'Nas reservas confirmadas de hoje', 'ph-users'],
        ['Pagamentos pendentes', pendingPayment.length, 'Em todas as reservas da demonstração', 'ph-hourglass'],
        ['Valor recebido hoje', currency(confirmed.filter(r => r.payment === 'Pago').reduce((sum,r) => sum+r.total,0)), 'Reservas de hoje com pagamento marcado como pago', 'ph-currency-circle-dollar']
    ];
    document.getElementById('metrics').innerHTML = metrics.map(([label,value,note,icon]) => `<article class="metric"><div class="metric-top"><span>${label}</span><span class="metric-icon"><i class="ph ${icon}" aria-hidden="true"></i></span></div><strong>${value}</strong><small>${note}</small></article>`).join('');
    document.getElementById('today-departures').innerHTML = groupByDeparture(confirmed).map(group => {
        const activity = activities[group.tour];
        const count = group.items.reduce((sum,r) => sum+pax(r),0);
        return `<article class="departure"><div class="departure-time">${escapeHTML(group.time)}</div><div class="departure-body"><div class="departure-title"><span>${activity.title}</span><span class="badge badge-confirmed">${count}/${activity.capacity} pessoas</span></div><p>${group.items.length} reserva(s) confirmada(s)${group.tour === 'dayuse' ? ' · Permanência até 18h' : ''}</p><div class="occupancy" role="meter" aria-label="Participantes confirmados para ${activity.title} às ${escapeHTML(group.time)}" aria-valuemin="0" aria-valuemax="${activity.capacity}" aria-valuenow="${count}"><span style="width:${Math.min(100,count/activity.capacity*100)}%"></span></div><p>${Math.max(0,activity.capacity-count)} vagas livres nesta saída</p></div></article>`;
    }).join('') || emptyState();
    const pending = reservations.filter(r => r.status === 'Pendente').length;
    document.getElementById('attention-list').innerHTML = `<div class="attention-item"><i class="ph ph-clock" aria-hidden="true"></i><div><strong>${pending} reservas aguardando confirmação</strong><p>Confira as solicitações antes de organizar as próximas saídas.</p></div></div><div class="attention-item"><i class="ph ph-wallet" aria-hidden="true"></i><div><strong>${currency(pendingPayment.reduce((sum,r) => sum+r.total,0))} em pagamentos pendentes</strong><p>Acompanhe o recebimento antes da confirmação final.</p></div></div>`;
    document.getElementById('recent-reservations').innerHTML = renderTable(reservations.slice(0,5));
}
function filteredReservations() {
    const query = document.getElementById('filter-search').value.trim().toLocaleLowerCase('pt-BR');
    const date = document.getElementById('filter-date').value;
    const tour = document.getElementById('filter-tour').value;
    const status = document.getElementById('filter-status').value;
    return reservations.filter(r => (!query || `${escapeHTML(r.name)} ${escapeHTML(r.id)}`.toLocaleLowerCase('pt-BR').includes(query)) && (!date || r.date === date) && (!tour || r.tour === tour) && (!status || r.status === status));
}
function renderWorkspace() {
    const items = filteredReservations();
    const count = items.reduce((sum,r) => sum+(r.status === 'Cancelada' ? 0 : pax(r)),0);
    document.getElementById('results-count').textContent = `${items.length} reserva(s) · ${count} participante(s) em reservas não canceladas`;
    document.getElementById('results-title').textContent = currentView === 'agenda' ? 'Programação dos passeios' : 'Todas as reservas';
    document.getElementById('agenda-controls').hidden = currentView !== 'agenda';
    if (currentView !== 'agenda') {
        document.getElementById('workspace-results').innerHTML = renderTable(items);
        return;
    }
    document.getElementById('workspace-results').innerHTML = groupByDeparture(items).map(group => `<article class="agenda-group"><div class="agenda-group-heading"><span class="metric-icon"><i class="ph ${activities[group.tour].icon}" aria-hidden="true"></i></span><div><h3>${activities[group.tour].title}</h3><p>${displayDate(group.date)} · ${group.tour === 'dayuse' ? '08h às 18h' : escapeHTML(group.time)} · ${group.items.length} reserva(s)</p></div></div>${group.items.map(r => `<div class="agenda-reservation"><div><strong>${escapeHTML(r.name)}</strong><p>${escapeHTML(r.id)} · ${r.adults} adulto(s), ${r.children} criança(s)</p></div><div class="agenda-actions">${badge(r.status)}${detailsButton(r)}</div></div>`).join('')}</article>`).join('') || emptyState();
}
function changeView(view) {
    currentView = view;
    const titles = { overview:['Um olhar sobre o seu dia','Acompanhe as reservas e prepare a equipe para cada experiência.'], agenda:['Agenda de passeios','Organize as saídas e saiba quem vai participar de cada experiência.'], reservations:['Reservas dos visitantes','Consulte solicitações, participantes e a situação de cada reserva.'] };
    document.getElementById('page-title').textContent = titles[view][0];
    document.getElementById('page-description').textContent = titles[view][1];
    document.getElementById('overview-view').hidden = view !== 'overview';
    document.getElementById('workspace-view').hidden = view === 'overview';
    document.querySelectorAll('[data-view]').forEach(button => {
        button.classList.toggle('active', button.dataset.view === view);
        if (button.dataset.view === view) button.setAttribute('aria-current','page');
        else button.removeAttribute('aria-current');
    });
    if (view === 'agenda' && !document.getElementById('filter-date').value) document.getElementById('filter-date').value = REFERENCE_DATE;
    if (view !== 'overview') renderWorkspace();
}
function showDetails(id) {
    const r = reservations.find(item => item.id === id);
    if (!r) return;
    document.getElementById('detail-title').textContent = r.name;
    document.getElementById('reservation-details').innerHTML = `<div class="detail-summary">${badge(r.status)}${badge(r.payment)}<span class="badge badge-completed">${escapeHTML(r.id)}</span></div><dl class="detail-grid"><div><dt>Passeio</dt><dd>${activities[r.tour].title}</dd></div><div><dt>Data e horário</dt><dd>${displayDate(r.date)}/2026 · ${escapeHTML(r.time)}</dd></div><div><dt>Participantes</dt><dd>${r.adults} adulto(s) e ${r.children} criança(s)</dd></div><div><dt>Valor da reserva</dt><dd>${currency(r.total)}</dd></div></dl><div class="detail-note"><strong>Observações</strong><br>${escapeHTML(r.note)}</div><p class="detail-note" style="margin-top:12px">${r.source === 'site' ? 'Reserva salva neste navegador para demonstração.' : 'Exemplo fictício para apresentação.'}</p>`;
    document.getElementById('reservation-dialog').showModal();
    if (r.source === 'site') {
        const contact = document.createElement('div');
        contact.className = 'detail-note';
        contact.style.marginTop = '12px';
        const title = document.createElement('strong');
        title.textContent = 'Contato e participantes';
        contact.append(title);
        const phone = document.createElement('p');
        phone.textContent = `WhatsApp: ${r.phone || 'Não informado'}`;
        contact.append(phone);
        r.participants.forEach(participant => {
            if (!participant || typeof participant !== 'object') return;
            const line = document.createElement('p');
            line.textContent = `${participant.name || 'Participante'} · ${participant.age ?? 'Idade não informada'} anos`;
            contact.append(line);
        });
        document.getElementById('reservation-details').append(contact);
    }
}
document.addEventListener('click', event => {
    const viewButton = event.target.closest('[data-view], [data-open-view]');
    if (viewButton) changeView(viewButton.dataset.view || viewButton.dataset.openView);
    const detailButton = event.target.closest('[data-reservation]');
    if (detailButton) showDetails(detailButton.dataset.reservation);
});
['filter-search','filter-date','filter-tour','filter-status'].forEach(id => document.getElementById(id).addEventListener('input', renderWorkspace));
document.getElementById('clear-filters').addEventListener('click', () => {
    ['filter-search','filter-date','filter-tour','filter-status'].forEach(id => document.getElementById(id).value = '');
    renderWorkspace();
});
function moveDate(delta) {
    const input = document.getElementById('filter-date');
    const date = new Date(`${input.value || REFERENCE_DATE}T12:00:00`);
    date.setDate(date.getDate()+delta);
    input.value = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
    renderWorkspace();
}
document.getElementById('previous-day').addEventListener('click', () => moveDate(-1));
document.getElementById('next-day').addEventListener('click', () => moveDate(1));
document.getElementById('reference-day').addEventListener('click', () => { document.getElementById('filter-date').value = REFERENCE_DATE; renderWorkspace(); });
['close-details','close-details-footer'].forEach(id => document.getElementById(id).addEventListener('click', () => document.getElementById('reservation-dialog').close()));
function refreshReservations() {
    loadReservations();
    renderOverview();
    if (currentView !== 'overview') renderWorkspace();
}
window.addEventListener('storage', event => {
    if (event.key === window.PrototypeReservations.key || event.key === null) refreshReservations();
});
window.addEventListener('focus', refreshReservations);
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) refreshReservations();
});
refreshReservations();


