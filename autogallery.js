/*
This will retrieve the contents of the folder if the folder is configured as 'browsable'
http://stackoverflow.com/questions/18480550/how-to-load-all-the-images-from-one-of-my-folder-into-my-web-page-using-jquery?lq=1
To make a swipeable gallery, see:
http://demos.jquerymobile.com/1.4.2/swipe-page/#&ui-state=dialog
JQuery slideshow
http://jsfiddle.net/8FMsH/1/
*/
/*global $*/
/*jslint plusplus: true */

var filename,
    imgTags = '<img class="inner"></img>',
    imgElement,
    firstimage,
    curImg,
    topZindex,
    fullscreenIsOn = false,
    fullscreenButtonVar = {
        'padding': '4px',
        'background-color': '#bbb'
    },
    fullscreenButtonOuterVar = {
        'position': 'absolute',
        'right': '10px',
        'top': '10px'
    },
    fullscreenBackgroundVar,
    autogalleryContainerVar,
    innerVar,
    fileList = fileListPhp;

function slideforward(curImg, firstimage) {
    //	alert(curImg.attr('id'));
    if (curImg.attr('id') === $('.inner:last').attr('id')) {
        curImg = firstimage;
    } else {
        curImg = curImg.next('.inner');
    }
    return curImg;

}

function slideback(curImg, firstimage) {
    if (curImg.attr('id') === $(firstimage).attr('id')) {
        curImg = $('.inner:last');
    } else {
        curImg = curImg.prev('.inner');
    }
    return curImg;
}

function autogalleryfunc(dir, fileextension, galleryContainer, maxwidth, maxheight) {
    /* match http://www.timothyausten.com/paintings/autogallery/ */
    var thisDir = window.location.href.match(/.*\//)[0];

    // Get max height available for slideshow in order to fit it above the fold
    var body = document.body,
        html = document.documentElement,
        docHeight = Math.max(body.offsetHeight, html.offsetHeight),
        viewportWidth = Math.max(html.clientWidth, window.innerWidth || 0),
        viewportHeight = Math.max(html.clientHeight, window.innerHeight || 0),
        estimatedMaxheight = Math.floor((1 - docHeight / viewportHeight) * 100) + '%';

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

    // Optional parameters
    dir              = (typeof dir              === 'undefined') ? 'thisDir' : dir;
    fileextension    = (typeof fileextension    === 'undefined') ? '.jpg'    : fileextension;
    galleryContainer = (typeof galleryContainer === 'undefined') ? '#galleryContainer' : galleryContainer;
    maxwidth         = (typeof maxwidth         === 'undefined') ? '80%' : maxwidth;
    maxheight        = (typeof maxheight        === 'undefined') ? estimatedMaxheight : maxheight;
    // End of optional parameters

    var imgCssInitial = {
        'position': 'relative',
        'margin': '0 auto',
        'height': 'auto',
        'max-height': maxheight,
        'max-width': maxwidth,
        'top': 0,
        'left': 0,
        'border': '2px solid #4d4d4d',
        'overflow': 'hidden'
    },
        imgCssShow = {'display': 'block' };

    $(galleryContainer).attr({width: '100%', height: '100%'});

    $(function () {
        var galleryDivs =
            '<div id="fullscreenBackground"></div>' +
            '<div id="autogalleryContainer" width="100%" height="100%"></div>' +
            '<div id="fullscreenButtonOuter">' +
            '<div id="fullscreenButton">Fullscreen</div></div>';
        galleryDivs = $(galleryDivs);
        $(galleryContainer).append(galleryDivs);
    });

    $(function () {
        $('#fullscreenButtonOuter').css(fullscreenButtonOuterVar);
        $('#fullscreenButton').css(fullscreenButtonVar);
    });

    $.ajax({
        url: dir,
        success: function (data) {
            //List all jpg file names in the page
            var els,
                q1 = 'a:contains(' + fileextension + ')',
                q2 = 'a:contains(' + 'image.gif' + ')',
                q3 = 'a:contains(' + 'back.gif' + ')',
                q4 = 'a:contains(' + 'text.gif' + ')',
                q5 = 'a:contains(' + 'folder.gif' + ')',
                q6 = 'a:contains(' + 'unknown.gif' + ')';
            //include all elements whose anchor has fileextention
            //exclude back.gif and image2.gif
            // Check if the list of files has already been created in php.
            // If not, then scrape the automatically created page.
            console.log('fileList: ' + fileList);
            if (typeof fileList === 'undefined') {
                fileList = [];
                els = $(data).find(q1).not(q2).not(q3).not(q4).not(q5).not(q6);
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
            }
            for (i = 0; i < fileList.length; i++) {
                var filename = fileList[i]; // if url has no file at end
                imgElement = $(imgTags).attr({
                    'id'   : 'img' + i,
                    'src'  : dir + filename
                    //'data' : filename,
                    //'type' : 'image/svg+xml',
                });
                imgElement.css(imgCssInitial);
                imgElement.hide();
                $('#autogalleryContainer').append(imgElement);
            };

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
        }
    });

    // Manage fullscreen mode
    $(function () {
        fullscreenBackgroundVar = $('#fullscreenBackground');
        autogalleryContainerVar = $('#autogalleryContainer');
        innerVar = $('.inner');
    });

    function fullscreenOn() {
        $(function () {
            fullscreenBackgroundVar = $('#fullscreenBackground');
            autogalleryContainerVar = $('#autogalleryContainer');
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
            autogalleryContainerVar.css({
                'display': 'block',
                'position': 'absolute',
                'top': '0px',
                'left': '0px',
                'height': '100%',
                'width': '100%',
                'max-width': '100%',
                'max-height': '100%'
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
                // Detect whether device supports orientationchange event, otherwise fall back to
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
            $('#fullscreenButtonOuter').hide();
            fullscreenIsOn = true;
        });
    }
    function fullscreenOff() {
        $(function () {
            fullscreenBackgroundVar = $('#fullscreenBackground');
            autogalleryContainerVar = $('#autogalleryContainer');
            innerVar = $('.inner');
            fullscreenBackgroundVar.css({
                'filter': 'alpha(opacity=0)', /* IE */
                '-moz-opacity': 0, /* Mozilla */
                'opacity': 0 /* CSS3 */
            });
            autogalleryContainerVar.css({
                'position': 'static',
                'top': null,
                'left': null,
                'height': null,
                'width': null
            });
            innerVar.css(imgCssInitial);
            $('#fullscreenButtonOuter').css({'display': 'block'});
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
            }
        });
        // If esc of f11
        $(document).keyup(function (e) {
            if (e.keyCode === 27 || e.keyCode === 122) {
                fullscreenOff();
            }
        });
    });
}
