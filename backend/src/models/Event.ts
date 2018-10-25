import db from '@libs/db'

export const Seat = db.Model.extend({
    tableName: 'order_seats',
    hasTimestamps: ['create_at', 'update_at']
}) as typeof db.Model
