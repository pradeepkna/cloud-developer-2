import express, { Router, Request, Response } from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';
import * as validUrl from 'valid-url';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
 
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]
  
  app.get('/filteredimage/', async (req: Request, res: Response) => {
    
    // 1. validate the image_url query
    // destruct our query paramaters
    let { image_url } = req.query;
    //let validUrl = require('valid-url');
  
    if (validUrl.isUri(image_url)){
        console.log('Looks like an URI');
    } else {
        console.log('Not a URI');
        return res.status(400).send({ auth: false, message: 'URL is required or malformed' });
    }
    
    // 2. call filterImageFromURL(image_url) to filter the image 
    const filteredpath = await filterImageFromURL(image_url);
    
    // 3. send the resulting file in the response
    res.status(200).sendFile(filteredpath);
    
    // 4. deletes any files on the server on finish of the response
    var filesArray:string[] = [filteredpath]
    deleteLocalFiles(filesArray);

});


  /**************************************************************************** */

  //! END @TODO1
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();