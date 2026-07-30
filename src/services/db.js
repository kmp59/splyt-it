// Single import point for all DB operations — picks local or Firebase based on VITE_DATA_MODE.
// Both modules are imported statically; only one is ever called at runtime.

import * as localDb from './local/db'
import * as firebaseDb from './firebase/db'

const impl = import.meta.env.VITE_DATA_MODE === 'local' ? localDb : firebaseDb

export const createGroup       = impl.createGroup
export const joinGroup         = impl.joinGroup
export const completeGroup     = impl.completeGroup
export const archiveGroup      = impl.archiveGroup
export const reopenGroup       = impl.reopenGroup
export const addGuestToGroup   = impl.addGuestToGroup
export const addMemberToGroup  = impl.addMemberToGroup
export const recordPayment     = impl.recordPayment
export const getPayments       = impl.getPayments
export const getUserGroups     = impl.getUserGroups
export const getGroupById      = impl.getGroupById
export const getGroupMembers   = impl.getGroupMembers
export const searchUsers       = impl.searchUsers
export const addExpense        = impl.addExpense
export const getExpenses       = impl.getExpenses
export const deleteExpense     = impl.deleteExpense
export const updateExpense     = impl.updateExpense
export const subscribeToUserGroups = impl.subscribeToUserGroups
export const subscribeToGroup      = impl.subscribeToGroup
export const subscribeToExpenses   = impl.subscribeToExpenses
