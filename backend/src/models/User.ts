import db from '@libs/db'

export const User = db.Model.extend({
    tableName: 'users',
    hasTimestamps: ['create_at', 'update_at']
}) as typeof db.Model
