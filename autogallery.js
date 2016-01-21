/*
This will retrieve the contents of the folder if the folder is configured as 'browsable'
http://stackoverflow.com/questions/18480550/how-to-load-all-the-images-from-one-of-my-folder-into-my-web-page-using-jquery?lq=1
To make a swipeable gallery, see:
http://demos.jquerymobile.com/1.4.2/swipe-page/#&ui-state=dialog
JQuery slideshow
http://jsfiddle.net/8FMsH/1/

Tasks:

Make file extension argument accept JSON list, for example:
['.jpg','.png','.gif']

If page too big to fit gallery above fold, then set max height to window height. Then user can still scroll down and fit slide show in window.

*/
/*global $,console*/
/*jslint plusplus: true, white: true, vars: true*/
//"true: white" removes indentation requirements. this is an issue with "case"
//"vars: true" removes requirement for only one var statment per function
// version 0.7

var fullscreenIsOn = false;

(function () {
    // Fun with polyfills
    
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

    // .contains() not supported in chrome,
    // use polyfill instead.
    if (!String.prototype.contains) {
        String.prototype.contains = function () {
            return String.prototype.indexOf.apply(this, arguments) !== -1;
        };
    }
}());

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

function debugDimensions() {
    'use strict';
    var body = document.body,
        html = document.documentElement;
    
        console.log(
        'body.clientHeight: ' + body.clientHeight + '\n' +
        'body.scrollHeight: ' + body.scrollHeight + '\n' +
        'body.offsetHeight: ' + body.offsetHeight + '\n' +
        'html.clientHeight: ' + html.clientHeight + '\n' +
        'html.scrollHeight: ' + html.scrollHeight + '\n' +
        'html.offsetHeight: ' + html.offsetHeight
    );

    // ---

    // if body is smaller than viewport, then the viewport size is returned. http://stackoverflow.com/a/14036545

    (function () {
        // check individual heights of header, gallery, and footer.
        var header = document.getElementsByTagName('header')[0].scrollHeight,
            gallery = document.getElementById('galleryId').scrollHeight,
            footer;
        if (document.getElementsByTagName('section')[0]) {
            var sectionHeight = document.getElementsByTagName('section')[0].scrollHeight;
            footer = sectionHeight;
            console.log('Section element exists');
        } else {
            console.log('Section element does not exist');
        }
        console.log(
            'header: ' + header + '\n' +
            'gallery: ' + gallery + '\n' +
            'footer: ' + footer + '\n' +
            '-----' + '\n' +
            'total: ' + (header + gallery + footer)
        );
    }());

    console.log(
        'body: ' + document.body.scrollHeight + '\n' +
        'body with jQuery: ' + $(document).height()
    );
    console.log(
        'viewport: window.innerHeight: ' + window.innerHeight + '\n' +
        'document.documentElement.clientHeight: ' + document.documentElement.clientHeight
    );
}

function EstimatedHeight(galleryContainer) {
    'use strict';
    // Get max height available for slideshow in order to fit it above the fold

    // remove body css height because
    // body height of 100% will set the body to 100% of the viewport,
    // preventing calculation of body height.
    document.body.style.height = 'auto';

    var thisObj = this,
        gallery = $('#' + galleryContainer),
        galleryH = gallery.height() < 0 ? 0 : gallery.height(),
        bodyHeight = Math.min(
            document.body.scrollHeight,
            document.documentElement.scrollHeight
        ),
        viewportHeight = Math.max(
            document.documentElement.clientHeight, window.innerHeight || 0
        );
    
    // Set the gallery height initially to something
    // excessively large to avoid the problem where
    // if body is smaller than viewport,
    // then viewport size is returned. http://stackoverflow.com/a/14036545
    gallery.css('height', '10000px');

    
    this.galleryH = galleryH;
    
    // debugDimensions();
    
    // Viewport dimensions:
    // window.innerHeight
    // document.documentElement.clientHeight

    // Element dimensions
    // .scrollHeight

    // Other dimensions
    // Gives viewport size + scrollbars
    // .offsetHeight


    
    // ---
    
    this.docHeight = bodyHeight;
    this.viewportWidth = Math.max(
        document.documentElement.clientWidth, window.innerWidth || 0
    );
    this.viewportHeight = viewportHeight;
    //  this.estimatedMaxheight = (1 + (galleryH - this.docHeight) / this.viewportHeight).round(2);
    this.estimatedMaxheight = (1 - (bodyHeight - galleryH) / viewportHeight).round(2);
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
        dimensions,
        docHeight,
        viewportHeight,
        estimatedMaxheight;
    
    // Optional parameters
    fileList         = (typeof fileList         === 'undefined') ? false : fileList;
    dir              = (typeof dir              === 'undefined') ? thisDir : dir;
    fileextension    = (typeof fileextension    === 'undefined') ? '.jpg'    : fileextension;
    galleryContainer = (typeof galleryContainer === 'undefined') ? 'galleryId' : galleryContainer;

    dimensions = new EstimatedHeight(galleryContainer);
    estimatedMaxheight = dimensions.estimatedMaxheight;
    maxwidth         = (typeof maxwidth         === 'undefined') ? 0.8 : maxwidth;
    maxheight        = (typeof maxheight        === 'undefined') ? estimatedMaxheight : maxheight;
    // End of optional parameters
    
    $(function () {
        $('html, body').css({
            'width': '100%',
            'height': '100%',
            'margin': '0',
            'padding': '0',
            'overflow': 'visible'
        });
        
        $('#' + galleryContainer).css({
            'width': '100%',
            'height': maxheight * 100 + '%',
            'margin': '0 auto',
            'padding': '0'
        });
        
        $('#' + galleryContainer).prepend($(
            '<div id="fullscreenBackground"></div>' +
            '<div id="fullscreenButton">Fullscreen</div>'
        ));

        $('#fullscreenButton').css({
            'position': 'absolute',
            'right': '10px',
            'top': '10px',
            'display': 'block',
            'padding': '4px',
            'background-color': '#bbb'
        });
    });

    function fileListTasks(fileList) {
        var i, j,
            yahooHostingGifs = ['image.gif', 'back.gif', 'text.gif', 'folder.gif', 'unknown.gif'];
        
        // Exclude some things from file list
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
            // If file name is an empty string
            if (fileList[i] === thisDir) {
                fileList.splice(i, 1);
            }
        }

        
        
        // Create image elements from file list
        function makeImg(i) {
            var imgEl = [],
                imgCssInitial = {
                    'position': 'relative',
                    'margin': '0 auto',
                    'padding': '0',
                    'max-height': '100%',
                    'max-width': maxwidth * 100 + '%',
                    'border': '2px solid #4d4d4d'
                };

            imgEl[i] = $('<img class="inner"></img>').attr({
                'id'   : 'img' + i,
                'src'  : dir + fileList[i]
                //'data' : fileList[i],
                //'type' : 'image/svg+xml',
            }).css(imgCssInitial);
            imgEl[i].hide();
            imgEl[i].onload = function () {
                imgEl[i].css(imgCssInitial);
            };
            $('#' + galleryContainer).append(imgEl[i]);
        }
        
        for (i = 0; i < fileList.length; i++) {
            makeImg(i);
        }
        
        (function () {
            // Hide current image and show next.
            // If last image, go to first.
            var firstimage = $('.inner:first'),
                curImg = firstimage;
            curImg.css('display', 'block');
            $('.inner').click(function (event) {
                curImg.hide();
                curImg = slideforward(curImg, firstimage).show();
            });
            window.onkeydown = function (evt) {
                evt = evt || window.event; // prevent default
                switch (evt.keyCode) {
                    case 37:
                        // left arrow key
                        curImg.hide();
                        curImg = slideback(curImg, firstimage).show();
                        break;
                    case 39:
                        // right arrow key
                        curImg.hide();
                        curImg = slideforward(curImg, firstimage).show();
                        break;
                }
            };
        }());    
            

        // Manage fullscreen mode

        function fullscreenOn() {
            $(function () {
                var fullscreenBackgroundEl = $('#fullscreenBackground'),
                    innerVar = $('.inner');
                fullscreenBackgroundEl.css({
                    'background': '#000',
                    'filter': 'alpha(opacity=80)',
                    'opacity': 0.8,
                    'display': 'block',
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
                $('#fullscreenButton').html('[x]');
                fullscreenIsOn = true;
            });
        }
        
        function fullscreenOff() {
            $(function () {
                $('#fullscreenBackground').css({ 'display': 'none' });
                $('.inner').css({
                    'position': 'relative',
                    'margin': '0 auto',
                    'top': 0,
                    'left': 0,
                    'max-width': maxwidth * 100 + '%',
                    'border': '2px solid #4d4d4d'
                });
                
                dimensions = new EstimatedHeight(galleryContainer);
                dimensions.resize;
                
                $('#fullscreenButton').html('[ ]');
                fullscreenIsOn = false;
                // bookmark
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
                var innerVar = $('.inner');
                if (fullscreenIsOn) {
                    // center image vertically and horizontally
                    innerVar.each(function () {
                        $(this).css('top', ($(window).height() - $(this).height()) / 2);
                        $(this).css('left', ($(window).width() - $(this).width()) / 2);
                    });
                } else {
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
    
    function fileListAjax(data) {
        //List all jpg file names in the page
        //include all elements whose anchor has fileextention
        // Check if the list of files has already been created in php.
        // If not, then scrape the automatically created page.

        var filename,
            q1 = 'a:contains(' + fileextension + ')',
            fileList = [],
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
        fileListTasks(fileList);
    }

    // If fileList not already provided,
    // then get it with Ajax
    if (!fileList) {
        $.ajax({
            url: dir,
            success: function (data) {
                fileListAjax(data);
            }
        });
    } else {
        fileListTasks(fileList);
    }
}

