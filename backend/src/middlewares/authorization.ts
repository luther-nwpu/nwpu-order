import createJwtMiddleware from '@libs/jwt'
import { DEBUG_NAMESPACE, JWT_SECRET } from '@config'
import { User } from '@models'

export const jwtMiddleware = [
    createJwtMiddleware({
        secret: JWT_SECRET,
        bearer: '$user',
        debugNamespace: DEBUG_NAMESPACE.JWT,
        ignores: [
            'POST:/users/sessions',
            'POST:/users',
            'GET:/test',
            'GET:/seat',
            'POST:/seat'
        ]
    }),

    /**
     * query user from db
     */
    async function (ctx, next) {
        if (!ctx.state.$user) {
            return next()
        }

        const userInfo = await new User().where({ user_id: ctx.state.$user.user_id }).fetch()
        userInfo.set('wx_info', JSON.parse(userInfo.get('wx_info')))

        if (userInfo) {
            ctx.state.user = userInfo.toJSON()
            return next()
        } else {
            throw new Error('Error when login')
        }
    }
]
