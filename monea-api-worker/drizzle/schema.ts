/**
 * Drizzle ORM Schema for MONEA
 * 
 * Migrated from Prisma schema.prisma
 * Compatible with Neon PostgreSQL + Cloudflare Workers
 */

import { pgTable, text, timestamp, boolean, integer, decimal, json, pgEnum, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================================================
// ENUMS
// ============================================================================

export const userRoleEnum = pgEnum('UserRole', ['SUPERADMIN', 'ADMIN', 'STAFF']);
export const weddingStatusEnum = pgEnum('WeddingStatus', ['ACTIVE', 'ARCHIVED']);
export const packageTypeEnum = pgEnum('PackageType', ['FREE', 'PRO', 'PREMIUM']);
export const paymentStatusEnum = pgEnum('PaymentStatus', ['PENDING', 'AWAITING_VERIFICATION', 'PAID']);
export const eventTypeEnum = pgEnum('EventType', ['wedding', 'anniversary']);
export const analyticsTypeEnum = pgEnum('AnalyticsType', ['VIEW', 'MAP_CLICK', 'SAVE_DATE', 'RSVP_OPEN', 'RSVP_SUBMIT']);
export const deviceTypeEnum = pgEnum('DeviceType', ['MOBILE', 'DESKTOP']);
export const rsvpStatusEnum = pgEnum('RsvpStatus', ['PENDING', 'CONFIRMED', 'DECLINED']);
export const currencyEnum = pgEnum('Currency', ['USD', 'KHR']);
export const paymentMethodEnum = pgEnum('PaymentMethod', ['Cash', 'ABA', 'Wing', 'ACLEDA', 'KHQR', 'Other']);
export const mediaTypeEnum = pgEnum('MediaType', ['IMAGE', 'VIDEO']);
export const staffRoleEnum = pgEnum('StaffRole', ['SCANNER', 'CASHIER', 'STAFF']);
export const logActionEnum = pgEnum('LogAction', ['CHECK_IN', 'GIFT', 'UPDATE', 'DELETE', 'CREATE', 'PAYMENT_APPROVAL', 'LOGIN_FAILURE']);
export const securityEventEnum = pgEnum('SecurityEvent', [
  'LOGIN_FAILED', 'LOGIN_SUCCESS', 'RATE_LIMIT_EXCEEDED', 
  'PASSWORD_CHANGE_SUCCESS', 'PASSWORD_CHANGE_FAILED',
  'TWOFA_SETUP', 'TWOFA_VERIFY', 'TWOFA_DISABLED', 'TWOFA_VERIFY_FAILED',
  'SESSION_REVOKED'
]);
export const broadcastTypeEnum = pgEnum('BroadcastType', ['INFO', 'WARNING', 'SUCCESS']);
export const ticketStatusEnum = pgEnum('TicketStatus', ['OPEN', 'CLOSED', 'PENDING']);
export const ticketPriorityEnum = pgEnum('TicketPriority', ['LOW', 'NORMAL', 'HIGH']);
export const governanceActionEnum = pgEnum('GovernanceAction', [
  'PUBLISH', 'ROLLBACK', 'CONFIG_UPDATE', 
  'ENABLE_2FA', 'DISABLE_2FA', 'REVOKE_SESSIONS'
]);

// ============================================================================
// TABLES
// ============================================================================

export const users = pgTable('User', {
  id: text('id').primaryKey(),
  name: text('name'),
  phone: text('phone'),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').default(false).notNull(),
  password: text('password'),
  googleId: text('googleId').unique(),
  telegramId: text('telegramId').unique(),
  avatar: text('avatar'),
  role: userRoleEnum('role').default('ADMIN').notNull(),
  twoFactorSecret: text('twoFactorSecret'),
  twoFactorEnabled: boolean('twoFactorEnabled').default(false).notNull(),
  twoFactorRecoveryCodes: text('twoFactorRecoveryCodes'),
  failedAttempts: integer('failedAttempts').default(0).notNull(),
  lockedUntil: timestamp('lockedUntil'),
  sessionsRevokedAt: timestamp('sessionsRevokedAt'),
  deletedAt: timestamp('deletedAt'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => ({
  createdAtIdx: index('User_createdAt_idx').on(table.createdAt),
  deletedAtIdx: index('User_deletedAt_idx').on(table.deletedAt),
  roleCreatedAtIdx: index('User_role_createdAt_idx').on(table.role, table.createdAt),
}));

export const weddings = pgTable('Wedding', {
  id: text('id').primaryKey(),
  groomName: text('groomName').notNull(),
  brideName: text('brideName').notNull(),
  location: text('location'),
  date: timestamp('date').notNull(),
  eventType: eventTypeEnum('eventType').default('wedding').notNull(),
  templateId: text('templateId').default('classic').notNull(),
  themeSettings: json('themeSettings'),
  notes: text('notes'),
  weddingCode: text('weddingCode').unique(),
  status: weddingStatusEnum('status').default('ACTIVE').notNull(),
  packageType: packageTypeEnum('packageType').default('FREE').notNull(),
  paymentStatus: paymentStatusEnum('paymentStatus').default('PENDING').notNull(),
  expiresAt: timestamp('expiresAt'),
  userId: text('userId').notNull(),
  telegramLink: text('telegramLink'),
  paymentInfo: text('paymentInfo'),
  paymentHash: text('paymentHash'),
  bakongTrxId: text('bakongTrxId'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('Wedding_userId_idx').on(table.userId),
  statusIdx: index('Wedding_status_idx').on(table.status),
  createdAtIdx: index('Wedding_createdAt_idx').on(table.createdAt),
  paymentStatusIdx: index('Wedding_paymentStatus_idx').on(table.paymentStatus),
  packageTypeIdx: index('Wedding_packageType_idx').on(table.packageType),
  userIdStatusCreatedAtIdx: index('Wedding_userId_status_createdAt_idx').on(table.userId, table.status, table.createdAt),
  statusPaymentStatusIdx: index('Wedding_status_paymentStatus_idx').on(table.status, table.paymentStatus),
}));

export const invitationAnalytics = pgTable('InvitationAnalytics', {
  id: text('id').primaryKey(),
  weddingId: text('weddingId').notNull(),
  type: analyticsTypeEnum('type').notNull(),
  ipHash: text('ipHash'),
  userAgent: text('userAgent'),
  deviceType: deviceTypeEnum('deviceType'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
}, (table) => ({
  weddingIdIdx: index('InvitationAnalytics_weddingId_idx').on(table.weddingId),
  createdAtIdx: index('InvitationAnalytics_createdAt_idx').on(table.createdAt),
  weddingIdTypeCreatedAtIdx: index('InvitationAnalytics_weddingId_type_createdAt_idx').on(table.weddingId, table.type, table.createdAt),
}));

export const activities = pgTable('Activity', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  time: text('time').notNull(),
  description: text('description'),
  icon: text('icon'),
  publicId: text('publicId'),
  order: integer('order').default(0).notNull(),
  weddingId: text('weddingId').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
}, (table) => ({
  weddingIdIdx: index('Activity_weddingId_idx').on(table.weddingId),
}));

export const guests = pgTable('Guest', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone'),
  group: text('group'),
  source: text('source'),
  weddingId: text('weddingId').notNull(),
  hasArrived: boolean('hasArrived').default(false).notNull(),
  arrivedAt: timestamp('arrivedAt'),
  views: integer('views').default(0).notNull(),
  rsvpStatus: rsvpStatusEnum('rsvpStatus').default('PENDING'),
  adultsCount: integer('adultsCount').default(1).notNull(),
  childrenCount: integer('childrenCount').default(0),
  rsvpNotes: text('rsvpNotes'),
  rsvpAt: timestamp('rsvpAt'),
  guestCode: text('guestCode'),
  sequenceNumber: integer('sequenceNumber'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => ({
  weddingIdGuestCodeUnique: uniqueIndex('Guest_weddingId_guestCode_key').on(table.weddingId, table.guestCode),
  weddingIdIdx: index('Guest_weddingId_idx').on(table.weddingId),
  hasArrivedIdx: index('Guest_hasArrived_idx').on(table.hasArrived),
  weddingIdCreatedAtIdx: index('Guest_weddingId_createdAt_idx').on(table.weddingId, table.createdAt),
  weddingIdRsvpStatusIdx: index('Guest_weddingId_rsvpStatus_idx').on(table.weddingId, table.rsvpStatus),
  weddingIdHasArrivedIdx: index('Guest_weddingId_hasArrived_idx').on(table.weddingId, table.hasArrived),
  weddingIdGroupIdx: index('Guest_weddingId_group_idx').on(table.weddingId, table.group),
}));

export const gifts = pgTable('Gift', {
  id: text('id').primaryKey(),
  amount: decimal('amount').notNull(),
  currency: currencyEnum('currency').notNull(),
  method: paymentMethodEnum('method'),
  weddingId: text('weddingId').notNull(),
  guestId: text('guestId'),
  sequenceNumber: integer('sequenceNumber'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => ({
  weddingIdIdx: index('Gift_weddingId_idx').on(table.weddingId),
  guestIdIdx: index('Gift_guestId_idx').on(table.guestId),
  methodIdx: index('Gift_method_idx').on(table.method),
  currencyIdx: index('Gift_currency_idx').on(table.currency),
  weddingIdCreatedAtIdx: index('Gift_weddingId_createdAt_idx').on(table.weddingId, table.createdAt),
}));

export const galleryItems = pgTable('GalleryItem', {
  id: text('id').primaryKey(),
  url: text('url').notNull(),
  publicId: text('publicId'),
  type: mediaTypeEnum('type').notNull(),
  caption: text('caption'),
  weddingId: text('weddingId').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
}, (table) => ({
  weddingIdIdx: index('GalleryItem_weddingId_idx').on(table.weddingId),
  weddingIdCreatedAtIdx: index('GalleryItem_weddingId_createdAt_idx').on(table.weddingId, table.createdAt),
}));

export const guestbookEntries = pgTable('GuestbookEntry', {
  id: text('id').primaryKey(),
  guestName: text('guestName').notNull(),
  message: text('message').notNull(),
  voiceUrl: text('voiceUrl'),
  weddingId: text('weddingId').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
}, (table) => ({
  weddingIdIdx: index('GuestbookEntry_weddingId_idx').on(table.weddingId),
  weddingIdCreatedAtIdx: index('GuestbookEntry_weddingId_createdAt_idx').on(table.weddingId, table.createdAt),
}));

export const staff = pgTable('Staff', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').unique(),
  password: text('password'),
  pin: text('pin'),
  role: staffRoleEnum('role').default('STAFF').notNull(),
  weddingId: text('weddingId').notNull(),
  accessToken: text('accessToken').unique(),
  twoFactorSecret: text('twoFactorSecret'),
  twoFactorEnabled: boolean('twoFactorEnabled').default(false).notNull(),
  twoFactorRecoveryCodes: text('twoFactorRecoveryCodes'),
  failedAttempts: integer('failedAttempts').default(0).notNull(),
  lockedUntil: timestamp('lockedUntil'),
  sessionsRevokedAt: timestamp('sessionsRevokedAt'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
}, (table) => ({
  weddingIdIdx: index('Staff_weddingId_idx').on(table.weddingId),
  weddingIdRoleIdx: index('Staff_weddingId_role_idx').on(table.weddingId, table.role),
}));

export const logs = pgTable('Log', {
  id: text('id').primaryKey(),
  action: logActionEnum('action').notNull(),
  description: text('description').notNull(),
  actorName: text('actorName').notNull(),
  ip: text('ip'),
  userAgent: text('userAgent'),
  weddingId: text('weddingId').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
}, (table) => ({
  weddingIdIdx: index('Log_weddingId_idx').on(table.weddingId),
  createdAtIdx: index('Log_createdAt_idx').on(table.createdAt),
  weddingIdCreatedAtIdx: index('Log_weddingId_createdAt_idx').on(table.weddingId, table.createdAt),
}));

export const blacklistedIPs = pgTable('BlacklistedIP', {
  id: text('id').primaryKey(),
  ip: text('ip').notNull().unique(),
  reason: text('reason'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const ipSecurity = pgTable('IpSecurity', {
  id: text('id').primaryKey(),
  ip: text('ip').notNull().unique(),
  failures: integer('failures').default(0).notNull(),
  blockedUntil: timestamp('blockedUntil'),
  lastAttempt: timestamp('lastAttempt').defaultNow().notNull(),
});

export const securityLogs = pgTable('SecurityLog', {
  id: text('id').primaryKey(),
  event: securityEventEnum('event').notNull(),
  ip: text('ip').notNull(),
  geoIp: text('geoIp'),
  userAgent: text('userAgent'),
  email: text('email'),
  details: text('details'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
}, (table) => ({
  eventIdx: index('SecurityLog_event_idx').on(table.event),
  createdAtIdx: index('SecurityLog_createdAt_idx').on(table.createdAt),
  ipIdx: index('SecurityLog_ip_idx').on(table.ip),
  emailIdx: index('SecurityLog_email_idx').on(table.email),
}));

export const systemConfig = pgTable('SystemConfig', {
  id: text('id').primaryKey().default('GLOBAL'),
  maintenanceMode: boolean('maintenanceMode').default(false).notNull(),
  maintenanceStart: timestamp('maintenanceStart'),
  maintenanceEnd: timestamp('maintenanceEnd'),
  allowNewSignups: boolean('allowNewSignups').default(true).notNull(),
  globalCheckIn: boolean('globalCheckIn').default(true).notNull(),
  stadPrice: decimal('stadPrice').default('9.0').notNull(),
  proPrice: decimal('proPrice').default('19.0').notNull(),
  bakongConfig: json('bakongConfig'),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export const broadcasts = pgTable('Broadcast', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: broadcastTypeEnum('type').default('INFO').notNull(),
  active: boolean('active').default(true).notNull(),
  scheduledAt: timestamp('scheduledAt'),
  expiresAt: timestamp('expiresAt'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
}, (table) => ({
  activeExpiresAtIdx: index('Broadcast_active_expiresAt_idx').on(table.active, table.expiresAt),
}));

export const supportTickets = pgTable('SupportTicket', {
  id: text('id').primaryKey(),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  status: ticketStatusEnum('status').default('OPEN').notNull(),
  priority: ticketPriorityEnum('priority').default('NORMAL').notNull(),
  weddingId: text('weddingId').notNull(),
  userId: text('userId').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => ({
  weddingIdIdx: index('SupportTicket_weddingId_idx').on(table.weddingId),
  userIdIdx: index('SupportTicket_userId_idx').on(table.userId),
  statusPriorityIdx: index('SupportTicket_status_priority_idx').on(table.status, table.priority),
  createdAtIdx: index('SupportTicket_createdAt_idx').on(table.createdAt),
}));

export const systemVersions = pgTable('SystemVersion', {
  id: text('id').primaryKey(),
  versionName: text('versionName').notNull(),
  configData: json('configData').notNull(),
  description: text('description'),
  isStable: boolean('isStable').default(false).notNull(),
  createdBy: text('createdBy').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const governanceLogs = pgTable('GovernanceLog', {
  id: text('id').primaryKey(),
  action: governanceActionEnum('action').notNull(),
  details: json('details').notNull(),
  actorId: text('actorId').notNull(),
  actorName: text('actorName').notNull(),
  ip: text('ip'),
  userAgent: text('userAgent'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
}, (table) => ({
  actorIdIdx: index('GovernanceLog_actorId_idx').on(table.actorId),
  createdAtIdx: index('GovernanceLog_createdAt_idx').on(table.createdAt),
  actionIdx: index('GovernanceLog_action_idx').on(table.action),
}));

export const weddingTemplateVersions = pgTable('WeddingTemplateVersion', {
  id: text('id').primaryKey(),
  weddingId: text('weddingId').notNull(),
  versionName: text('versionName').notNull(),
  templateId: text('templateId').notNull(),
  themeData: json('themeData').notNull(),
  description: text('description'),
  createdBy: text('createdBy').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
}, (table) => ({
  weddingIdIdx: index('WeddingTemplateVersion_weddingId_idx').on(table.weddingId),
}));

export const dailySecuritySummaries = pgTable('DailySecuritySummary', {
  id: text('id').primaryKey(),
  date: timestamp('date').notNull().unique(),
  totalLogins: integer('totalLogins').notNull(),
  failedAttempts: integer('failedAttempts').notNull(),
  blockedIps: integer('blockedIps').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export const passwordResetTokens = pgTable('PasswordResetToken', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
}, (table) => ({
  emailIdx: index('PasswordResetToken_email_idx').on(table.email),
}));

export const signupOTPs = pgTable('SignupOTP', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  otp: text('otp').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
}, (table) => ({
  emailIdx: index('SignupOTP_email_idx').on(table.email),
}));

// ============================================================================
// RELATIONS (for joins)
// ============================================================================

export const usersRelations = relations(users, ({ many }) => ({
  weddings: many(weddings),
  supportTickets: many(supportTickets),
}));

export const weddingsRelations = relations(weddings, ({ one, many }) => ({
  user: one(users, {
    fields: [weddings.userId],
    references: [users.id],
  }),
  activities: many(activities),
  galleryItems: many(galleryItems),
  gifts: many(gifts),
  guests: many(guests),
  guestbookEntries: many(guestbookEntries),
  analytics: many(invitationAnalytics),
  logs: many(logs),
  staff: many(staff),
  supportTickets: many(supportTickets),
  templateVersions: many(weddingTemplateVersions),
}));

export const guestsRelations = relations(guests, ({ one, many }) => ({
  wedding: one(weddings, {
    fields: [guests.weddingId],
    references: [weddings.id],
  }),
  gifts: many(gifts),
}));

export const giftsRelations = relations(gifts, ({ one }) => ({
  wedding: one(weddings, {
    fields: [gifts.weddingId],
    references: [weddings.id],
  }),
  guest: one(guests, {
    fields: [gifts.guestId],
    references: [guests.id],
  }),
}));
