/*

Plugin for support for multiple audiotracks within a video file.
Date: 2013-01-23
Author: Christian Horn, chorn1@uno.edu
Comments:
currently this feauture works only in Internet Explorer 10 on Windows 8.
Other platforms may crash by trying to play multi-audio .mp4 file
(such as Windows 7, even with IE10; and Mac OS X with safari).
If native player used on Apple iDevice then it works also in fullscreen (native).

*/


(function ($) {
  
    // add extra default options 
    $.extend(mejs.MepDefaults, {
        // this will automatically turn on audioTracks
        startAudioLanguage: 'en',
        allowedAudioLanguages: ['en','de'],
        audioTracksText: 'Audio Language'
    });

    $.extend(MediaElementPlayer.prototype, {

        buildaudiotracks: function (player, controls, layers, media) {

            if (!player.isVideo)
                return;

            //if (player.audioTracks.length == 0)
            //	return;
            // TODO: could not copy audioTracks values into player object, since they are only available after video headers are loaded...

            if (!mejs.MediaFeatures.supportsAudioTracks)
                return;
            
            var t = this, i, options = '';

            player.audioTracks =
					$('<div class="mejs-audiotracks-layer mejs-layer"><div class="mejs-audiotracks-position"><span class="mejs-audiotracks-text"></span></div></div>')
						.prependTo(layers).hide();
            player.audioTracksText = player.audioTracks.find('.mejs-audiotracks-text');
            player.audioTracksButton =
					$('<div class="mejs-button mejs-audiotracks-button">' +
						'<button type="button" aria-controls="' + t.id + '" title="' + t.options.audioTracksText + '"></button>' +
						'<div class="mejs-audiotracks-selector">' +
							'<ul>' +
							'</ul>' +
						'</div>' +
					'</div>')
						.appendTo(controls)

						// hover
						.hover(function () {
						    $(this).find('.mejs-audiotracks-selector').css('visibility', 'visible');
						}, function () {
						    $(this).find('.mejs-audiotracks-selector').css('visibility', 'hidden');
						});
            


            if (!player.options.alwaysShowControls) {
                // move with controls
                player.container
					.bind('mouseenter', function () {
					    // audioTracks bin above controls
					    player.container.find('.mejs-audiotracks-position').addClass('mejs-audiotracks-position-hover');

					})
					.bind('mouseleave', function () {
					    if (!media.paused) {
					        // move back to normal place
					        player.container.find('.mejs-audiotracks-position').removeClass('mejs-audiotracks-position-hover');
					    }
					});
            } else {
                player.container.find('.mejs-audiotracks-position').addClass('mejs-audiotracks-position-hover');
            }
            // adds all audio Languages, only available after "loadeddata" event of video.
            media.addEventListener("loadeddata", function () {
                for (i = 0; i < media.audioTracks.length; i++) {                                                                                    
                    var audioTrack = media.audioTracks[i];
                    //If langauge is allowed (to restrict langauges included in audiofile from playing)
                    if (jQuery.inArray(audioTrack.language, player.options.allowedAudioLanguages) != -1) {
                        t.addAudioTrackButton(audioTrack.language, audioTrack.label);
                    }
                    t.enableAudioTrackButton(audioTrack.language, audioTrack.label);
                }
                    // handle clicks to the language radio buttons
                        player.audioTracksButton.delegate('input[type=radio]', 'click', function () {
                            lang = this.value;
                            console.log("selected langauge1: " + lang);
                            if (lang == 'none') {
                                //player.selectedAudioTrack = null;
                                //Throw Error: such as no langauge found...?!
                            } else {
                                for (i = 0; i < media.audioTracks.length; i++) {
                                    var audioTrack = media.audioTracks[i];
                                    if (audioTrack.language == lang) {
                                        player.selectedAudioTrack = audioTrack;
                                        console.log("selected language: " + player.selectedAudioTrack.language);
                                        console.log(" language LANG: " + lang);
                                        player.audioTracks.attr('lang', player.selectedAudioTrack.language);
                                        player.playAudio(i, media.audioTracks.length);
                                        break;
                                    }
                                }
                            }
                        });                    
                }, false)
        },
    //activate the audiotracks
    enableAudioTrackButton: function(lang, label) {
        var t = this;
			
        if (label === '') {
            label = mejs.language.codes[lang] || lang;
        }			
        //look for radiobutton and enable
        t.audioTracksButton
            .find('input[value=' + lang + ']')
                .prop('disabled', false)
            .siblings('label')
                .html(label);

        // set start language
        if (t.options.startAudioLanguage == lang) {
            $('#' + t.id + '_audiotracks_' + lang).click();
        }

        t.adjustAudioLanguageBox();
    },
    // generates HTML for audiotrack button
    addAudioTrackButton: function(lang, label) {
        var t = this;
        if (label === '') {
            label = mejs.language.codes[lang] || lang;
        }

        t.audioTracksButton.find('ul').append(
            $('<li>' +
                '<input type="radio" name="' + t.id + '_audiotracks" id="' + t.id + '_audiotracks_' + lang + '" value="' + lang + '" disabled="disabled" />' +
                '<label for="' + t.id + '_audiotracks_' + lang + '">' + label + ' (loading)' + '</label>' +
            '</li>')
        );

        t.adjustAudioLanguageBox();

        // remove this from the dropdownlist (if it exists)
        //t.container.find('.mejs-audiotracks-translations option[value=' + lang + ']').remove();
    },

    //anpassen der Größe der AudioTracks Box, falls es viele Sprachen gibt.
    adjustAudioLanguageBox:function() {
        var t = this;        
        t.audioTracksButton.find('.mejs-audiotracks-selector').height(
            t.audioTracksButton.find('.mejs-audiotracks-selector ul').outerHeight(true) +
            t.audioTracksButton.find('.mejs-audiotracks-translations').outerHeight(true)
        );
    },
    
        //Next function activates selected language (i) and deactivates the others. 
        //Waiting for proposed "selected" attribute of whatwg will be implemented in browsers
        // maybe a better way to write this?

    playAudio: function (i, j) {
        var t = this,
            k;
        var atracks = t.$media.context.audioTracks;
        for (k = 0; k < j; k++) {
            var atrack = atracks[k];
            if (k == i) {
                atrack.enabled = true;
            } else {
                atrack.enabled = false;
            }
        }
    }
    });
})(mejs.$);