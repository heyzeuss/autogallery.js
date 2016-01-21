# autogallery.js

## Create slide show from JSON image list

## Usage

Include liabrary in page in `script` tag, usually at end of body with other libraries:

    <script type='text/javascript' src='autogallery.js'></script>
    
### With arguments

It accepts arguments for:
 * List of files (Default: See note on list of files)
 * Directory of the files (Default: Home directory)
 * File extension of files to include (Default: '.jpg')
 * Slide show container ID (Default: 'galleryId')
 * Slide show container max width (Default: '.0.8')
 * Slide show container max height (Default: whatever empty height remaining)

```javascript
  var fileList = ['cat.jpg', 'dog.jpg', 'bird.jpg', 'rabbit.jpg'],
    dir = 'animalpics/',
    fileextension = '.jpg',
    containerId = 'myContainer',
    maxwidth, /* Variable will be undefined and script will default to '0.8' */
    maxheight = '0.7';
  autogalleryfunc(fileList, dir, fileextension, containerId, maxwidth, maxheight);
```

### With no arguments

To run autogallery.js with all arguments omitted, such as:

```javascript
  autogalleryfunc();
```

 1. Create a div container with the ID 'galleryId'.
 2. Save the page to the same folder as the images.
 3. Make sure the folder is browseable.
 4. Use only .jpg images.

### List of files

Autogallery can use AJAX to create a list of files, based on the contents of a browsable folder. To enable this behavior, make sure that the folder is indeed browsable. If the page is in the same directory as the images, name it something other than index.html, index.htm, or index.php so your web server will be able to perform autoindex directory listing of the files in the folder. If you browse to the folder, it should say something like "Index of /folder." This will give AJAX the list of files that it needs to produce a JSON list.

### Slide show navigation

Mouse clicks and screen taps advance the slide show. Arrow keys are for previous and next.
