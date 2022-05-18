import { logger } from '../config/index'
import { Router, Response, Request } from 'express'
import { Filters } from '../entities/Filters'
import { userHasPermissions } from './auth/middleware'

/**
 * @openapi
 * tags: 
 *  - name: filters
 *    description: Filters
 */
const router = Router()
/**
 * @openapi
 * /filters:
 *  get:
 *    tags:
 *      - filters
 *    operationId: searchFilters
 *    summary: Search Filters records
 *    description: Get Filters records
 *    responses:
 *        200:
 *          content:
 *            application/json:
 *              schema:
 *                  type: array
 *                  items:
 *                      $ref: '#/components/schemas/Filters'
 *  post:
 *    tags:
 *      - filters
 *    operationId: createFilters
 *    summary: Create a Filters record
 *    description: Create a new Filters record
 *    requestBody:
 *      content:
 *          application/json:
 *              schema: 
 *                  $ref: '#/components/schemas/Filters'
 *    responses:
 *      201:
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Filters'
 */
router.route('/')
    .get(userHasPermissions(), async (req: Request, res: Response) => {
        const items = await Filters.find({})
        res.json(items)
    })
    .post(userHasPermissions(), async (req: Request, res: Response) => {
        const item = new Filters(req.body)
        await item.save()
        res.status(201).json(item)
    })

/**
 * @openapi
 * /filters/{id}:
 *  parameters:
 *      - in: path
 *        name: id
 *  get:
 *      tags:
 *          - filters
 *      operationId: getFilters
 *      summary: Get a single Filters record
 *      description: Get a single Filters record
 *      responses:
 *          200:
 *              description: Success
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Filters'
 *          404:
 *              description: Item not found
 *          default:
 *              description: An unknown error occurred
 *  patch:
 *      tags:
 *          - filters
 *      operationId: updateFilters
 *      summary: Update a single Filters record
 *      description: Update a single Filters record
 *      responses:
 *          200:
 *              description: Success
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Filters'
 *          404:
 *              description: Item not found
 *          default:
 *              description: An unknown error occurred 
 *  delete:
 *      tags:
 *          - filters
 *      operationId: deleteFilters
 *      summary: Delete a Filters record
 *      description: Delete a Filters record
 *      responses:
 *          204:
 *              description: Success
 *          404:
 *              description: Item not found
 *          default:
 *              description: An unknown error occurred
 */
router.route('/:id')
    .get(userHasPermissions(), async (req: Request, res: Response) => {
        try {
            const item = await Filters.findOne({ _id: req.params.id })
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
    .patch(userHasPermissions(), async (req: Request, res: Response) => {
        try {
            if (req.body.name) {
                req.body.name = req.body.name.toLowerCase()
            }
            const item = await Filters.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true })
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
    .delete(userHasPermissions(), async (req: Request, res: Response) => {
        try {
            const item = await Filters.deleteOne({ _id: req.params.id })
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
