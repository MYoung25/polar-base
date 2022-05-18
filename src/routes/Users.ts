import { logger } from '../config/index'
import { Router, Response, Request } from 'express'
import {IUser, Users} from '../entities/Users'
import { userHasPermissions } from './auth/middleware'

/**
 * @openapi
 * tags: 
 *  - name: users
 *    description: Users Routes
 */
const router = Router()
/**
 * @openapi
 * /users:
 *  get:
 *      tags:
 *          - users
 *      operationId: searchUsers
 *      summary: Search users records
 *      description: Get users records
 *      responses:
 *          200:
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          items:
 *                              $ref: '#/components/schemas/Users'
 *  post:
 *      tags:
 *          - users
 *      operationId: createUser
 *      summary: Create a users record
 *      description: Create a new users record
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema: 
 *                      $ref: '#/components/schemas/Users'
 *      responses:
 *          201:
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Users'
 */
router.route('/')
    .get(userHasPermissions('public'), async (req: Request, res: Response) => {
        const items = await Users.find({})
        res.json(items)
    })
    .post(userHasPermissions('public'), async (req: Request, res: Response) => {
        const item = new Users(req.body)
        await item.save()
        res.status(201).json(item)
    })
/**
 *  @openapi
 *  /users/me:
 *      get:
 *          tags:
 *              - users
 *          operationId: getMe
 *          summary: Get currently logged in user
 *          description: Get information about the currently logged in user
 *          security:
 *              - cookieAuth: []
 *          responses:
 *              401:
 *                  description: Unauthenticated
 *              200:
 *                  description: Me
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/UsersMe'
 */
router.route('/me')
    .get(userHasPermissions(), async (req, res) => {
        res.status(200)
        const reqUser = (req.user as IUser)
        if (reqUser && '_id' in reqUser) {
            const user = await Users.findByIdWithPermissionsAndFilters(reqUser._id)
            return res.json(user)
        }

    })

/**
 * @openapi
 * /users/{id}:
 *  parameters:
 *      - in: path
 *        name: id
 *  get:
 *      tags:
 *          - users
 *      summary: Get a single user record
 *      description: Get a single user record
 *      operationId: getUser
 *      responses:
 *          200:
 *              description: Success
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Users'
 *          404:
 *              description: Item not found
 *          default:
 *              description: An unknown error occurred
 *  patch:
 *      tags:
 *          - users
 *      summary: Update a single user record
 *      description: Update a single users record
 *      operationId: updateUser
 *      responses:
 *          200:
 *              description: Success
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Users'
 *          404:
 *              description: Item not found
 *          default:
 *              description: An unknown error occurred 
 *  delete:
 *      tags:
 *          - users
 *      summary: Delete a user record
 *      description: Delete a users record
 *      operationId: deleteUser
 *      responses:
 *          204:
 *              description: Success
 *          404:
 *              description: Item not found
 *          default:
 *              description: An unknown error occurred
 */
router.route('/:id')
    .get(userHasPermissions('public'), async (req: Request, res: Response) => {
        try {
            const item = await Users.findOne({ _id: req.params.id })
            if (item) {
                res.json(item)
                return
            }
            res.sendStatus(404)
        } catch (e) {
            res.sendStatus(500)
            logger.error(e)
        }
    })
    .patch(userHasPermissions('public'), async (req: Request, res: Response) => {
        try {
            const item = await Users.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true })
            if (item) {
                res.json(item)
                return
            }
            res.sendStatus(404)
        } catch (e) {
            res.sendStatus(500)
            logger.error(e)
        }
    })
    .delete(userHasPermissions('public'), async (req: Request, res: Response) => {
        try {
            const item = await Users.deleteOne({ _id: req.params.id })
            if (item.deletedCount === 1) {
                res.sendStatus(204)
                return
            }
            res.sendStatus(404)
        } catch (e) {
            res.sendStatus(500)
            logger.error(e)
        }
    })

export default router
