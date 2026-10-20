// The order lifecycle as a tiny state machine. The admin UI asks the API which moves are allowed,
// so this table is the single source of truth.
//
//   PENDING_PAYMENT -> PAID | CANCELLED
//   PAID            -> FULFILLED | CANCELLED
//   FULFILLED, CANCELLED are final.
const TRANSITIONS = {
    PENDING_PAYMENT: ['PAID', 'CANCELLED'],
    PAID: ['FULFILLED', 'CANCELLED'],
    FULFILLED: [],
    CANCELLED: []
};

const allowedTransitions = (from) => TRANSITIONS[from] || [];

const canTransition = (from, to) => allowedTransitions(from).includes(to);

module.exports = { TRANSITIONS, allowedTransitions, canTransition };
