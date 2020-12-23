import { Router, Request, Response } from 'express';
import { FeedItem } from '../models/FeedItem';
import { requireAuth } from '../../users/routes/auth.router';
import * as AWS from '../../../../aws';

const router: Router = Router();

// Get all feed items
router.get('/', async (req: Request, res: Response) => {
    const items = await FeedItem.findAndCountAll({order: [['id', 'DESC']]});
    items.rows.map((item) => {
            if(item.url) {
                item.url = AWS.getGetSignedUrl(item.url);
            }
    });
    res.send(items);
});

//@TODO
//Add an endpoint to GET a specific resource by Primary Key
router.get('/:id', async (req: Request, res: Response) => {
        
        //@TODO try it yourself
        // destruct our path params
        let { id } = req.params;

        // check to make sure the id is set
        if (!id) { 
        // respond with an error if not
         return res.status(400).send(`id is required`);
        }
        const item1 = await FeedItem.findByPk(id);
        
        if(!item1){
            return res.status(404).send('Item with the id not found')
        }
        else{
            return res.status(200).send(item1);
            
        }
});
// update a specific resource
router.patch('/:id', async (req: Request, res: Response) => {
        
        //@TODO try it yourself
        // destruct our path params
        let { id } = req.params;

        // check to make sure the id is set
        if (!id) { 
        // respond with an error if not
         return res.status(400).send(`id is really required`);
        }
        // destruct our body payload for our variables
        let { caption1, url1 } = req.body;
        
        try {
        const result = await FeedItem.update(
        
          // Set Attribute values 
            { caption: caption1,
            url: url1 },
        
          // Where clause / criteria 
            { where: { id: id } } )
                res.send(200).send("Update successful")
        } catch (err) {
                res.send(500).send("FeedItem update failed !");
        }
        
});


// Get a signed url to put a new item in the bucket
router.get('/signed-url/:fileName', 
    requireAuth, 
    async (req: Request, res: Response) => {
    let { fileName } = req.params;
    const url = AWS.getPutSignedUrl(fileName);
    res.status(201).send({url: url});
});

// Post meta data and the filename after a file is uploaded 
// NOTE the file name is they key name in the s3 bucket.
// body : {caption: string, fileName: string};
router.post('/', 
    requireAuth, 
    async (req: Request, res: Response) => {
    const caption = req.body.caption;
    const fileName = req.body.url;

    // check Caption is valid
    if (!caption) {
        return res.status(400).send({ message: 'Caption is required or malformed' });
    }

    // check Filename is valid
    if (!fileName) {
        return res.status(400).send({ message: 'File url is required' });
    }

    const item = await new FeedItem({
            caption: caption,
            url: fileName
    });

    const saved_item = await item.save();

    saved_item.url = AWS.getGetSignedUrl(saved_item.url);
    res.status(201).send(saved_item);
});

export const FeedRouter: Router = router;

function newFunction(url1: any): any {
    return { url: url1 };
}
