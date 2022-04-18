import request from 'supertest'
import mongoose from 'mongoose'
import { app } from './index'
import { User } from '../entities/User'
import { ErrnoException } from '../app'

declare global {
    var __MONGO_URI__: string
}

// suppress error messages
const mockConsoleError = jest.spyOn(console, 'error')
    .mockImplementation((err: ErrnoException) => {})

describe('/api/User', () => {
    let connection: any
    beforeAll(async () => {
        connection = await mongoose.connect(global.__MONGO_URI__ as string)
    });

    afterAll(async () => {
        await connection.disconnect()
    })

    describe('GET', () => {

        beforeAll(async () => {
            await new User({}).save()
        })

        afterAll(async () => {
            await User.deleteMany({})
        })

        it('returns a 200', async () => {
            const response = await request(app).get('/User')
            expect(response.statusCode).toBe(200)
        })

        it('returns all Users', async() => {
            const response = await request(app).get('/User')
            expect(response.body.length).toBe(1)
        })

    })

    describe('POST', () => {

        afterAll(async () => {
            await User.deleteMany({})
        })

        it('returns a 201', async () => {
            const response = await request(app).post('/User').send({})
            expect(response.statusCode).toBe(201)
        })

        it('returns the new User', async () => {
            const response = await request(app).post('/User').send({ firstName: 'User' })
            expect(response.body).toHaveProperty('firstName', 'User')
        })

        it('inserts the new User', async () => {
            const response = await request(app).post('/User').send({ firstName: 'User' })
            const item = await User.findById(response.body._id)
            expect(item).toHaveProperty('firstName', 'User')
        })

    })

    describe('/:id', () => {
        let item: any

        beforeAll(async () => {
            item = await new User({}).save()
        })

        afterAll(async () => {
            await User.deleteMany({})
        })

        describe('GET', () => {

            it('returns a 200', async () => {
                const response = await request(app).get(`/User/${item._id}`)
                expect(response.statusCode).toBe(200)
            })

            it('returns the User', async () => {
                const response = await request(app).get(`/User/${item._id}`)
                expect(response.body).toHaveProperty('_id', expect.any(String))
                expect(response.body).toHaveProperty('__v', 0)
            })

            it('returns a 404', async () => {
                const response = await request(app).get(`/User/${new mongoose.Types.ObjectId()}`)
                expect(response.statusCode).toBe(404)
            })

            it('sends a 500 if a cast error occurs on _id', async () => {
                const response = await request(app).get(`/User/dfghjkkjhgf`)
                expect(response.statusCode).toBe(500)
            })

        })

        describe('PATCH', () => {

            it('returns a 200', async () => {
                const response = await request(app).patch(`/User/${item._id}`).send({ firstName: 'User' })
                expect(response.statusCode).toBe(200)
            })

            it('returns the updated User', async () => {
                const response = await request(app).patch(`/User/${item._id}`).send({ firstName: 'Superman' })
                expect(response.body).toHaveProperty('firstName', 'Superman')
            })

            it('returns a 404', async () => {
                const response = await request(app).patch(`/User/${new mongoose.Types.ObjectId()}`).send({ name: 'User' })
                expect(response.statusCode).toBe(404)
            })

            it('sends a 500 if a cast error occurs on _id', async () => {
                const response = await request(app).patch(`/User/dfghjkkjhgf`).send({ name: 'User' })
                expect(response.statusCode).toBe(500)
            })

        })

        describe('DELETE', () => {

            it('returns a 204', async () => {
                const response = await request(app).delete(`/User/${item._id}`)
                expect(response.statusCode).toBe(204)
            })

            it('deletes the User', async () => {
                await request(app).delete(`/User/${item._id}`)
                const found = await User.findById(item._id)
                expect(found).toBeNull()
            })

            it('tries to delete a nonexistent User', async () => {
                const response = await request(app).delete(`/User/${new mongoose.Types.ObjectId()}`)
                expect(response.statusCode).toBe(404)
            })

            it('sends a 500 if an error occurs', async () => {
                const response = await request(app).delete(`/User/dfghjkkjhgf`)
                expect(response.statusCode).toBe(500)
            })

        })

    })

})
