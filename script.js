$(document).ready(function () {
    var videoId;
    var mousePosition = { x: 0, y: 0 };
    var topRectId = 0;
    var isResizing = false;
    function pf(str) {
        return parseFloat(str);
    }
    var els = {
        frame: $('#videoFrame'),
        vanillaFrame: function () {
            return document.getElementById('videoFrame');
        },
        input: $('#urlInput'),
        form: $('#urlForm'),
        cover: $('#videoCover'),
        textboxes: $('#textboxes'),
    };
    var c = {
        defaultSquareRadius: 40,
        radiusResizeIncrement: 20,
    };
    var u = {
        getParameterByName: function (name, url) {
            // copied from http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
            if (!url) {
                url = window.location.href;
            }
            name = name.replace(/[\[\]]/g, "\\$&");
            var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
                results = regex.exec(url);
            if (!results) return null;
            if (!results[2]) return '';
            return decodeURIComponent(results[2].replace(/\+/g, " "));
        },
        getVideoId: function (url) {
            return this.getParameterByName("v", url);
        },
        getEmbedUrl: function (watchUrl) {
            return 'https://youtube.com/embed/' + this.getVideoId(watchUrl) + "?autoplay=1";
        },
        clickWithin: function (x, y, vanillaElem) {
            var elemLeft = pf(vanillaElem.offsetLeft);
            var elemRight = pf(vanillaElem.offsetLeft) + pf(vanillaElem.width);
            var elemTop = pf(vanillaElem.offsetTop);
            var elemBottom = pf(vanillaElem.offsetTop) + pf(vanillaElem.height);
            if (x < elemLeft || x > elemRight) {
                return false;
            }
            if (y < elemTop || y > elemBottom) {
                return false;
            }
            return true;
        }
    };

    els.form.submit(function (e) {
        e.preventDefault();
        videoId = u.getVideoId(els.input.val());
        view.displayVideo();
    });

    var view = {
        addRectCenteredAt: function (x, y, radius) {
            var trueLeft = Math.max(els.vanillaFrame().offsetLeft, x - radius);
            console.log(x);
            var trueTop = Math.max(els.vanillaFrame().offsetTop, y - radius);
            var trueWidth = Math.min(els.vanillaFrame().offsetLeft + els.vanillaFrame().width - trueLeft, radius * 2);
            var trueHeight = Math.min(els.vanillaFrame().offsetTop + els.vanillaFrame().height - trueTop, radius * 2);
            view.drawAndFocusRect(trueLeft, trueTop, trueWidth, trueHeight);
        },
        drawAndFocusRect: function (x, y, width, height) {
            var toPrepend = this.drawRect(x, y, width, height);
            setTimeout(function () {
                toPrepend.get(0).focus();
            }, 10);
        },
        drawRect: function (x, y, width, height, firstBox) {
            var toPrepend = $('<div class="selection-square"></div>');
            toPrepend.attr('data-rectid', topRectId++);
            toPrepend.css({
                'width': width,
                'height': height,
                'top': y,
                'left': x
            });
            console.log('y is ' + y);
            console.log('x is ' + x);
            $('body').prepend(toPrepend);
            if (!firstBox) {
                view.applyRectModifiers(toPrepend);
            }
            return toPrepend;
        },
        addRow: function(newRect) {
            
        },
        applyRectModifiers: function (newRect) {
            var closer = $('<div class="fa fa-times-circle fa-3 box-closer" style="z-index: 90"></div>');
            closer.mousedown(function () {
                this.parentNode.remove();
            })
            newRect.append(closer);
            var handle = $('<div class="fa fa-arrows fa-3 handle" style="z-index: 90"></div>');
            newRect.append(handle);
            var number = $('<div class="fa"></div>');
            number.text(newRect.attr('data-rectid'));
            newRect.append(number);
            newRect.draggable({
                stop: function () {
                    controller.storeRect(view.currImage);
                },
                drag: function (event, ui) {
                    var imgRight = pf(els.vanillaFrame().offsetLeft) + pf(els.vanillaFrame().width);
                    var imgBottom = pf(els.vanillaFrame().offsetTop) + pf(els.vanillaFrame().height);
                    ui.position.left = Math.min(imgRight - parseFloat($(this).css('width')), Math.max(els.vanillaFrame().offsetLeft, ui.offset.left));
                    ui.position.top = Math.min(imgBottom - parseFloat($(this).css('height')), Math.max(els.vanillaFrame().offsetTop, ui.offset.top));
                },
            }).resizable({
                resize: function (event, ui) {
                    var imgRight = pf(els.vanillaFrame().offsetLeft) + pf(els.vanillaFrame().width);
                    var imgBottom = pf(els.vanillaFrame().offsetTop) + pf(els.vanillaFrame().height);
                    ui.size.width = Math.min(imgRight - this.offsetLeft, ui.size.width);
                    ui.size.height = Math.min(imgBottom - this.offsetTop, ui.size.height);
                }
            }).resize(function (event) {
                event.stopPropagation();
            });
            newRect.children().click(function (e) {
                e.stopPropagation()
            });
            newRect.dblclick(view.createBox);
            newRect.attr('tabindex', '-1');
        },
        createBox: function (event) {
            console.log(event.target);
            if (u.clickWithin(event.pageX, event.pageY, els.vanillaFrame())) {
                view.addRectCenteredAt(event.pageX, event.pageY, c.defaultSquareRadius);
            }
        },
        bindEvents: function () {
            els.cover.dblclick(view.createBox);
            // $(document).bind('mousemove', function (mouseMoveEvent) {
            //     mousePosition.x = mouseMoveEvent.pageX;
            //     mousePosition.y = mouseMoveEvent.pageY;
            // });
            $(document).keydown(function (event) {
                function subtractRadius(ind, val) {
                    return parseFloat(val) - c.radiusResizeIncrement;
                }

                function subtract2Radius(ind, val) {
                    return subtractRadius(0, subtractRadius(ind, val));
                }

                function subPos(ind, coords) {
                    var newCoords = {
                        top: coords.top - c.radiusResizeIncrement,
                        left: coords.left - c.radiusResizeIncrement
                    };
                    var imgCoords = $(els.vanillaFrame()).offset();
                    if (newCoords.top < imgCoords.top)
                        newCoords.top = imgCoords.top;
                    if (newCoords.left < imgCoords.left)
                        newCoords.left = imgCoords.left;
                    return newCoords;
                }

                function addPos(ind, coords) {
                    return {
                        top: coords.top + c.radiusResizeIncrement,
                        left: coords.left + c.radiusResizeIncrement
                    };
                }

                function addWidth(ind, width) {
                    // Square has already been shifted in position
                    width = parseFloat(width);
                    var newWidth = width + c.radiusResizeIncrement * 2;
                    var newSquareRight = this.offsetLeft + newWidth;
                    var imgRight = pf(els.vanillaFrame().offsetLeft) + pf(els.vanillaFrame().width);
                    if (newSquareRight > imgRight) {
                        newWidth = imgRight - this.offsetLeft;
                    }
                    return newWidth;
                }

                function addHeight(ind, height) {
                    height = parseFloat(height);
                    // Square has already been shifted in position
                    var newHeight = height + c.radiusResizeIncrement * 2;
                    var newSquareBottom = this.offsetTop + newHeight;
                    var imgBottom = pf(els.vanillaFrame().offsetTop) + pf(els.vanillaFrame().height);
                    console.log(newSquareBottom); console.log(imgBottom);
                    if (newSquareBottom > imgBottom) {
                        newHeight = imgBottom - this.offsetTop;
                    }
                    return newHeight;
                }

                function addRadius(ind, val) {
                    return parseFloat(val) + c.radiusResizeIncrement;
                }

                function add2Radius(ind, val) {
                    return addRadius(0, addRadius(ind, val));
                }
                switch (String.fromCharCode(event.which)) {
                    case 'P':
                        $('.selection-square:focus')
                            .offset(subPos)
                            .css('width', addWidth)
                            .css('height', addHeight);
                        break;
                    case 'O':
                        $('.selection-square:focus').css('top', addRadius)
                            .css('left', addRadius)
                            .css('width', subtract2Radius)
                            .css('height', subtract2Radius);
                        break;
                    case 'T':
                        if (u.clickWithin(mousePosition.x, mousePosition.y, els.vanillaFrame())) {
                            view.addRectCenteredAt(mousePosition.x, mousePosition.y, c.defaultSquareRadius);
                        }
                        break;
                }
            });
        },
        drawFirstBox: function () {
            var fr = els.vanillaFrame();
            var rectElem = this.drawRect(fr.offsetLeft, fr.offsetTop, fr.width, fr.height, true);
            rectElem.addClass('coverbox');
        },
        displayVideo: function () {
            var player = new YT.Player('videoFrame', {
                // height: '50%',
                // width: '70%',
                videoId: videoId,
                playerVars: { 'autoplay': 1, 'controls': 0 },
                events: {
                    'onReady': function (e) {
                        player.mute();
                        view.init();
                    }
                },
            });
        },
        init: function () {
            this.bindEvents();
            this.drawFirstBox();
        }
    };

    var controller = {
        storeRect: function (e) {

        }
    };
});