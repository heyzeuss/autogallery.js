/*
This will retrieve the contents of the folder if the folder is configured as 'browsable'
http://stackoverflow.com/questions/18480550/how-to-load-all-the-images-from-one-of-my-folder-into-my-web-page-using-jquery?lq=1
To make a swipeable gallery, see:
http://demos.jquerymobile.com/1.4.2/swipe-page/#&ui-state=dialog
JQuery slideshow
http://jsfiddle.net/8FMsH/1/
*/
/*global $,console*/
/*jslint plusplus: true, white: true, vars: true*/
//"true: white" removes indentation requirements. this is an issue with "case"
//"vars: true" removes requirement for only one var statment per function
// version 0.7

var filename,
    imgTags = '<img class="inner"></img>',
    imgElement,
    firstimage,
    curImg,
    topZindex,
    fullscreenIsOn = false,
    fullscreenButtonVar = {
        'position': 'absolute',
        'right': '10px',
        'top': '10px',
        'display': 'block',
        'padding': '4px',
        'background-color': '#bbb'
    },
    fullscreenBackgroundVar,
    innerVar;

function slideforward(curImg, firstimage) {
    'use strict';
    //	alert(curImg.attr('id'));
    if (curImg.attr('id') === $('.inner:last').attr('id')) {
        curImg = firstimage;
    } else {
        curImg = curImg.next('.inner');
    }
    return curImg;

}

function slideback(curImg, firstimage) {
    'use strict';
    if (curImg.attr('id') === $(firstimage).attr('id')) {
        curImg = $('.inner:last');
    } else {
        curImg = curImg.prev('.inner');
    }
    return curImg;
}

function EstimatedHeight(galleryContainer) {
    'use strict';
    // Get max height available for slideshow in order to fit it above the fold

    // remove body css height because
    // body height of 100% will set the body to 100% of the viewport,
    // preventing calculation of body height.
    document.body.style.height = 'auto';

    var thisObj = this,
        body = document.body,
        html = document.documentElement,
        gallery = $('#' + galleryContainer),
        galleryH = gallery.height() < 0 ? 0 : gallery.height();
    this.galleryH = galleryH;
    this.docHeight = Math.max(
        body.scrollHeight,
        body.offsetHeight,
        html.clientHeight,
        html.scrollHeight,
        html.offsetHeight
    );
    this.viewportWidth = Math.max(html.clientWidth, window.innerWidth || 0);
    this.viewportHeight = Math.max(html.clientHeight, window.innerHeight || 0);
    //  this.estimatedMaxheight = (1 + (galleryH - this.docHeight) / this.viewportHeight).round(2);
    this.estimatedMaxheight = (1 - (this.docHeight - galleryH) / this.viewportHeight).round(2);
    /*this.minH = 0.2;
    if (this.estimatedMaxheight < this.minH) {
        this.estimatedMaxheight = this.minH;
    }*/

    this.resize = gallery.css({'height': this.estimatedMaxheight * 100 + '%'});

    // Make some test text
    (function () {
        var a = document.createElement('p'),
            b = document.getElementById('test');
        if (b) { b.parentNode.removeChild(b); }
        a.innerHTML =
            'Document: ' + thisObj.docHeight + '<br />' +
            'Viewport: ' + thisObj.viewportHeight + '<br />' +
            'galleryH: ' + thisObj.galleryH + '<br />' +
            'everythingElse: ' + (thisObj.docHeight - thisObj.galleryH) + '<br />' +
            'body.offsetHeight: ' + document.body.offsetHeight;
        a.style.position = 'absolute';
        a.style.top = '100px';
        a.style.left = '10px';
        a.id = 'test';
        document.body.appendChild(a);
    });

    // set body css height to 100% again
    document.body.style.height = '100%';
}

function autogalleryfunc(fileList, dir, fileextension, galleryContainer, maxwidth, maxheight) {
    'use strict';
    /* match http://www.timothyausten.com/paintings/autogallery/ */
    var thisDir = window.location.href.match(/.*\//)[0],
        imgCssInitial,
        imgCssShow,
        dimensions,
        docHeight,
        viewportHeight,
        estimatedMaxheight;
    
    /*alert(
        'section: ' + $('section').height() +
        '\nclientheight: ' + html.clientHeight +
        '\ninnerHeight: ' + window.innerHeight +
        '\nscrollHeight: ' + body.scrollHeight +
        '\nbodyOffsetHeight: ' + body.offsetHeight +
        '\nhtmlOffsetHeight: ' + html.offsetHeight +
        '\ndocHeight: ' + docHeight +
        '\nviewportHeight: ' + viewportHeight +
        '\nmaxHeight: ' + estimatedMaxheight
    );*/

    // add a better rounding method to Number.prototype
    // http://stackoverflow.com/questions/27035308/add-a-rounding-method-to-number-prototype-in-javascript/27035309#27035309
    // (3.141592).round(2);
    // returns: 3.14
    if (!Number.prototype.round) {
        Number.prototype.round = function (decimals) {
            if (typeof decimals === 'undefined') {
                decimals = 0;
            }
            return Math.floor(
                this * Math.pow(10, decimals)
            ) / Math.pow(10, decimals);
        };
    }

    // Optional parameters
    fileList         = (typeof fileList         === 'undefined') ? false : fileList;
    dir              = (typeof dir              === 'undefined') ? 'thisDir' : dir;
    fileextension    = (typeof fileextension    === 'undefined') ? '.jpg'    : fileextension;
    galleryContainer = (typeof galleryContainer === 'undefined') ? 'galleryContainer' : galleryContainer;

    dimensions = new EstimatedHeight(galleryContainer);
    docHeight = dimensions.docHeight;
    viewportHeight = dimensions.viewportHeight;
    estimatedMaxheight = dimensions.estimatedMaxheight;
    console.log('docHeight: ' + docHeight);

    maxwidth         = (typeof maxwidth         === 'undefined') ? 0.8 : maxwidth;
    maxheight        = (typeof maxheight        === 'undefined') ? estimatedMaxheight : maxheight;
    // End of optional parameters
    
    
    imgCssInitial = {
        'position': 'relative',
        'margin': '0 auto',
        'padding': '0',
        'max-height': '100%',
        'max-width': maxwidth * 100 + '%',
        'top': 0,
        'left': 0,
        'border': '2px solid #4d4d4d'
    };
    imgCssShow = {'display': 'block'};

    console.log('beginning max height: ' + maxheight);
    
    $(function () {
        var galleryDivs;

        $('html, body').css({
            'width': '100%',
            'height': '100%',
            'margin': '0',
            'padding': '0',
            'overflow': 'visible'
        });
        $('#' + galleryContainer).css({
            'width': '100%',
            'margin': '0 auto',
            'padding': '0'
        });
    
        galleryDivs =
            '<div id="fullscreenBackground"></div>' +
            '<div id="fullscreenButton">Fullscreen</div>';
        galleryDivs = $(galleryDivs);
        $('#' + galleryContainer).append(galleryDivs);

        $('#fullscreenButton').css(fullscreenButtonVar);
    });

    $.ajax({
        url: dir,
        success: function (data) {
            //List all jpg file names in the page
            var i, j,
                els,
                q1 = 'a:contains(' + fileextension + ')',
                yahooHostingGifs = ['image.gif', 'back.gif', 'text.gif', 'folder.gif', 'unknown.gif'];
            //include all elements whose anchor has fileextention
            //exclude back.gif and image2.gif
            // Check if the list of files has already been created in php.
            // If not, then scrape the automatically created page.
            if (!fileList) {
                fileList = [];
                els = $(data).find(q1);
                els.each(function (itr) {
                    filename = this.href.replace(thisDir, ''); // if url has no file at end
                    // filename = this.href.replace(window.location.href, ''); // if url has no file at end
                    // this.host            = www.timothyausten.com
                    // this.href            = http://www.timothyausten.com/autogallery/001-mid.jpg
                    // window.location.host = www.timothyausten.com
                    // window.location.href = http://www.timothyausten.com/autogallery

                    //var imgTags='<object><img src="alt_img.png" alt="altimgexample"/></object>';
                    //var imgTags='<object></object>';
                    fileList.push(filename);
                });
                // console.log(fileList ? 'fileList: ' + fileList : 'fileList: none');
            }
            
            // .contains() not supported in chrome,
            // use polyfill instead.
            if (!String.prototype.contains) {
                String.prototype.contains = function () {
                    return String.prototype.indexOf.apply(this, arguments) !== -1;
                };
            }
            
            for (i = 0; i < fileList.length; i++) {
                // Get some unnecessary files created by yahoo hosting out of the list
                for (j = 0; j < yahooHostingGifs.length; j++) {
                    if (fileList[i].contains(yahooHostingGifs[j])) {
                        fileList.splice(i, 1);
                    }
                }
                // Include only files with right file extension
                if (!fileList[i].contains(fileextension)) {
                    fileList.splice(i, 1);
                }
                // If file name is a blank string
                if (fileList[i] === thisDir) {
                    fileList.splice(i, 1);
                }
                var filename = fileList[i]; // if url has no file at end
                imgElement = $(imgTags).attr({
                    'id'   : 'img' + i,
                    'src'  : dir + filename
                    //'data' : filename,
                    //'type' : 'image/svg+xml',
                });
                imgElement.css(imgCssInitial);
                imgElement.hide();
                $('#' + galleryContainer).append(imgElement);
            }

            // hide current image and show next one
            // if last image, go to first
            // yahoo hosting services adds an extra image to the top of the list,
            // so the first image is really the second
            firstimage = $('.inner:first');
            curImg = firstimage;
            curImg.css('display', 'block');
            $('.inner').click(function (event) {
                curImg.hide();
                curImg = slideforward(curImg, firstimage).css(imgCssShow);
            });
            window.onkeydown = function (evt) {
                evt = evt || window.event; // prevent default
                switch (evt.keyCode) {
                    case 37:
                        // left arrow key
                        curImg.hide();
                        curImg = slideback(curImg, firstimage).css(imgCssShow);
                        break;
                    case 39:
                        // right arrow key
                        curImg.hide();
                        curImg = slideforward(curImg, firstimage).css(imgCssShow);
                        break;
                }
            };

            // bookmark
            setTimeout(function() {
                dimensions = new EstimatedHeight(galleryContainer);
                dimensions.resize;
            }, 1000);
        }    
    });

    // Manage fullscreen mode
    
    function fullscreenOn() {
        $(function () {
            fullscreenBackgroundVar = $('#fullscreenBackground');
            innerVar = $('.inner');
            fullscreenBackgroundVar.css({
                'background': '#000',
                'filter': 'alpha(opacity=80)', /* IE */
                '-moz-opacity': 0.8, /* Mozilla */
                'opacity': 0.8, /* CSS3 */
                'position': 'absolute',
                'top': '0px',
                'left': '0px',
                'height': '100%',
                'width': '100%'
            });
            innerVar.css({
                'position': 'absolute',
                'max-width': '100%',
                'max-height': '100%',
                'border': '0'
            });
            function fsReposition() {
                // center image vertically and horizontally
                innerVar.each(function () {
                    $(this).css('top', ($(window).height() - $(this).height()) / 2);
                    $(this).css('left', ($(window).width() - $(this).width()) / 2);
                });
            }
            $(function () {
                fsReposition();
                // Detect whether device supports orientation change event, otherwise fall back to
                // the resize event.
                var supportsOrientationChange = 'onorientationchange' in window,
                    orientationEvent = supportsOrientationChange ? 'orientationchange' : 'resize';
                window.addEventListener(orientationEvent, fsReposition(), false);
            });
            (function () {
                var el = document.documentElement;
                var requestFS =
                    el.requestFullScreen ||
                    el.webkitRequestFullScreen ||
                    el.mozRequestFullScreen ||
                    el.msRequestFullscreen;
                requestFS.call(el);
            }());
            $('#fullscreenButton').hide();
            fullscreenIsOn = true;
        });
    }
    function fullscreenOff() {
        $(function () {
            fullscreenBackgroundVar = $('#fullscreenBackground');
            innerVar = $('.inner');
            fullscreenBackgroundVar.css({
                'filter': 'alpha(opacity=0)', /* IE */
                '-moz-opacity': 0, /* Mozilla */
                'opacity': 0 /* CSS3 */
            });
            innerVar.css(imgCssInitial);
            $('#fullscreenButton').css({'display': 'block'});
            fullscreenIsOn = false;
        });
    }

    $(function () {
        $('#fullscreenButton').click(function () {
            if (fullscreenIsOn) {
                fullscreenOff();
            } else {
                fullscreenOn();
            }
        });
        $(window).resize(function () {
            innerVar = $('.inner');
            if (fullscreenIsOn) {
                // center image vertically and horizontally
                innerVar.each(function () {
                    $(this).css('top', ($(window).height() - $(this).height()) / 2);
                    $(this).css('left', ($(window).width() - $(this).width()) / 2);
                });
            } else {
                // bookmark
                // resize gallery

                dimensions = new EstimatedHeight(galleryContainer);
                dimensions.resize;
            }
        });
        // If esc of f11
        $(document).keyup(function (e) {
            if (e.keyCode === 27 || e.keyCode === 122) {
                fullscreenOff();
            }
        });
    });

    // Make a test rectangle
    $(function () {
        var testRectStr = '<div id="testrectangle">',
            testRect = $(testRectStr).css({
                'position': 'absolute',
                'margin': '0 auto',
                'top': $('header').height() + 'px',
                'width': '80' + '%',
                'height': maxheight * 100 + '%',
                'border-style': 'solid',
                'border-color': 'red'
            });
        // $('header').append(testRect);
    });
}
