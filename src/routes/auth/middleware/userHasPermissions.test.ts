import { Request, Response } from 'express'
import userHasPermissions from './userHasPermissions'
import { Users } from "../../../entities/Users"
import { Serialization } from "../serialization"
import {Permissions} from "../../../entities/Permissions"
import {Roles} from "../../../entities/Roles"

const nextMock = jest.fn()
const isAuthenticated = jest.fn()
    .mockImplementation(() => false)

const req: Partial<Request> = {
    baseUrl: '/users',
    route: {
        path: '/me'
    },
    method: 'get',
    user: new Users({}),
    isAuthenticated
}
const res: Partial<Response> = {
    sendStatus: jest.fn()
}

describe('userHasPermissions', () => {
    let perm: any
    let role: any
    let user: any

    beforeAll(async () => {
        perm = await Permissions.findOne({ name: 'users.me.get' })
        role = await Roles.findOne({ name: 'USER' })
        user = await Users.findOne({ firstName: 'hello' })
    })

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('returns a function', () => {
        const result = userHasPermissions()
        expect(typeof result).toBe('function')
    })

    it('sends a 401 if unauthenticated', () => {
        userHasPermissions()(req as Request, res as Response, nextMock)
        expect(res.sendStatus).toHaveBeenCalledWith(401)
    })

    it('sends 401 if user has no permissions', () => {
        userHasPermissions()({...req, user: new Users({})} as Request, res as Response, nextMock)
        expect(res.sendStatus).toHaveBeenCalledWith(401)
    })

    it('calls next if user has permissions', async () => {
        expect.assertions(1)
        isAuthenticated.mockImplementationOnce(() => true)
        await Serialization.deserialize(user._id, (err, serializedUser) => {
            userHasPermissions()({...req, user: serializedUser } as Request, res as Response, nextMock)
            expect(nextMock).toHaveBeenCalled()
        })
    })

    describe('public', () => {

        it('calls next if \'public\' is passed in the parameters', () => {
            expect.assertions(1)
            userHasPermissions('public')(req as Request, res as Response, nextMock)
            expect(nextMock).toHaveBeenCalled()
        })

    })

})
