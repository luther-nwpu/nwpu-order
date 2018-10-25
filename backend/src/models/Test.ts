import db from '@libs/db'

export const Test = db.Model.extend({
    tableName: 'test',
    hasTimestamps: ['create_at', 'update_at']
}) as typeof db.Model
