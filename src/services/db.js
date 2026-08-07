// Single import point for all DB operations — picks local or Firebase based on VITE_DATA_MODE.
// Both modules are imported statically; only one is ever called at runtime.

import * as localDb from './local/db'
import * as firebaseDb from './firebase/db'

const impl = import.meta.env.VITE_DATA_MODE === 'local' ? localDb : firebaseDb

export const createGroup       = impl.createGroup
export const joinGroup         = impl.joinGroup
export const acceptInvite      = impl.acceptInvite
export const declineInvite     = impl.declineInvite
export const getPendingInvites = impl.getPendingInvites
export const completeGroup     = impl.completeGroup
export const archiveGroup      = impl.archiveGroup
export const reopenGroup       = impl.reopenGroup
export const addGuestToGroup   = impl.addGuestToGroup
export const addMemberToGroup  = impl.addMemberToGroup
export const removeMember      = impl.removeMember
export const mergeGuestIntoMember = impl.mergeGuestIntoMember
export const promoteToAdmin    = impl.promoteToAdmin
export const demoteAdmin       = impl.demoteAdmin
export const recordPayment     = impl.recordPayment
export const getPayments       = impl.getPayments
export const getUserGroups     = impl.getUserGroups
export const getGroupById      = impl.getGroupById
export const getGroupMembers   = impl.getGroupMembers
export const lookupUserByEmail = impl.lookupUserByEmail
export const getContacts       = impl.getContacts
export const addExpense        = impl.addExpense
export const getExpenses       = impl.getExpenses
export const deleteExpense     = impl.deleteExpense
export const updateExpense     = impl.updateExpense
export const subscribeToUserGroups    = impl.subscribeToUserGroups
export const subscribeToPendingInvites = impl.subscribeToPendingInvites
export const subscribeToGroup      = impl.subscribeToGroup
export const subscribeToExpenses   = impl.subscribeToExpenses
