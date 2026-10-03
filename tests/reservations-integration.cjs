const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const storage = new Map();
function createContext() {
    const elements = new Map();
    const events = new Map();
    const getElement = id => {
        if (!elements.has(id)) elements.set(id, {
            value: '', innerHTML: '', textContent: '', hidden: false,
            classList: { add() {}, remove() {}, toggle() {} },
            addEventListener() {}, append() {}, showModal() { this.open = true; },
            scrollTo() {}, style: {}
        });
        return elements.get(id);
    };
    const context = vm.createContext({
        localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key,value) => storage.set(key,value) },
        window: { addEventListener: (event,fn) => events.set(event,fn) },
        document: { getElementById: getElement, querySelectorAll: () => [], addEventListener() {}, createElement: () => ({ style:{}, append() {} }) },
        setTimeout() {}, clearInterval() {}, alert() {}, console
    });
    function run(file) { vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),context); }
    run('reservations-store.js');
    return { context, getElement, events, run };
}
const publicSite = createContext();
publicSite.run('script.js');
publicSite.getElement('form-name').value = 'Teste <script>alert(1)</script>';
publicSite.getElement('form-phone').value = '(35) 99999-0000';
vm.runInContext("currentTourId='horse'; bookingData={date:'15 de Outubro de 2026',time:'11:00',adults:2,children:1,totalPrice:240}; confirmBooking();", publicSite.context);
const saved = JSON.parse(storage.get('serra_verde_reserves'))[0];
assert.equal(saved.dateISO,'2026-10-15');
assert.equal(saved.tourId,'horse');
assert.equal(saved.adults,2);
assert.equal(saved.payment,'Pendente');
const admin = createContext();
admin.run('admin.js');
admin.context.changeView('reservations');
const html = admin.getElement('workspace-results').innerHTML;
assert(html.includes('Criada no site'));
assert(html.includes('&lt;script&gt;'));
assert(!html.includes('<script>'));
admin.getElement('filter-date').value = '2026-10-15';
assert.equal(admin.context.filteredReservations().length,1);
admin.context.showDetails(saved.id);
assert.equal(admin.getElement('reservation-dialog').open,true);
// Legacy records remain visible, even before responsible/participant data existed.
const records = JSON.parse(storage.get('serra_verde_reserves'));
records.push({id:'legacy',tour:'Day-Use Serra Verde',date:'16 de Outubro de 2026',time:'08:00 às 18:00',total:100,status:'Confirmada'});
storage.set('serra_verde_reserves',JSON.stringify(records));
admin.events.get('storage')({key:'serra_verde_reserves'});
admin.getElement('filter-date').value = '2026-10-16';
assert.equal(admin.context.filteredReservations().length,1);
storage.set('serra_verde_reserves','invalid JSON');
admin.events.get('focus')();
admin.getElement('filter-date').value = '';
assert.equal(admin.context.filteredReservations().length,12);
console.log('OK: criação, leitura no painel, filtros, detalhes, atualização entre abas, dados antigos e armazenamento inválido.');
