(function(document, window) {

  ///////////////////////////////////////////////
  // STATES
  ///////////////////////////////////////////////

  // delays in milliseconds
  var current_index = 0;
  var current_timeout_id = null;
  //variables representing states
  //(is_paused, is_started) === (false, false) means STOPPED
  //(is_paused, is_started) === (false, true) means PLAYING
  //(is_paused, is_started) === (true, false) means PAUSED
  var is_paused = false;
  var is_started = false;
  //time based on the length of the audio on which we should go to the next slide.
  //(in secs)
  var time_list = [];
  //store the duration for each slide
  var duration_list = [];
  //store all the slide elements
  var slides = [];

  //local constant variable
  //var journey_audio = $('#journey-audio');

  ///////////////////////////////////////////////
  // HELPER functions
  ///////////////////////////////////////////////
  var $ = function(selector) {
    return document.querySelector(selector);
  };

  var $$ = function(selector) {
    return arrayify(document.querySelectorAll(selector));
  };

  var css = function(el, styles) {
    for (key in styles) {
      el.style[key] = styles[key];
    }
  }

  var update_dict = function(dict1, dict2) {
    for (var key in dict2) {
      dict1[key] = dict2[key];
    }
    return dict1
  };

  var arrayify = function(a) {
    return [].slice.call(a);
  };

  // audio related helper functions

  var get_audio_time = function() {
    return $('#journey-audio').currentTime;
  };

  var set_offset = function(offset) {
    $('#journey-audio').currentTime = offset;
  };

  var resume_audio = function() {
    $('#journey-audio').play();
  };

  var play_audio_starting_at = function(secs) {
    set_offset(secs);
    resume_audio();
  };

  var play_audio_from = function(index) {
    if (index === 0) {
      play_audio_starting_at(0);
    } else {
      play_audio_starting_at(time_list[index-1]);
    }
  };

  var pause_audio = function() {
    $('#journey-audio').pause();
  };

  // slide related helper functions
  var display = function(index) {
    //todo
    prev_index = current_index;
    current_index = index;
    console.log('showing slide: ' + index + ' at: ' + (new Date()).getSeconds());
    css(slides[prev_index], {
      'display': 'none'
    })
    css(slides[current_index], {
      'display': 'block'
    })
  };

  var play_slide_from = function(index) {
    var wait_until_the_current_slide_times_up = function() {
      if (get_audio_time() >= time_list[current_index]) {
        play_slide_from(index+1);
      } else {
        current_timeout_id = window.setTimeout(wait_until_the_current_slide_times_up, 10);
      }
    };
    //use the currentTime of the audio as a timer
    if (index >= time_list.length) {
      console.log('you have reached the end');
      return;
    }
    display(index);
    wait_until_the_current_slide_times_up();
  };

  var init_styles = function() {
    // make <html> and <body> fill the whole window
    document.documentElement.style.height = "100%";
    css($('body'), {
      'height': '100%',
      'overflow': 'hidden',
      // margin of body is set to 8px by default
      'margin': 0,
    });

    centering = {
      'position': 'absolute',
      'top': '50%',
      'left': '50%',
      '-webkit-transform': 'translate(-50%, -50%)',
      'transform': 'translate(-50%, -50%)',
    };

    css($('#journey'), update_dict({
      'height': (window.innerHeight-36*2)*0.8 + 'px',
      'width': (window.innerWidth-114*2)*0.8 + 'px',
    }, centering));

    $$('.journey-img').forEach(function(el, idx, array) {
      var img_height = el.clientHeight;
      var img_width = el.clientWidth;
      var parent_height = $('#journey').clientHeight;
      var parent_width = $('#journey').clientWidth;
      if (img_height/img_width <= parent_height/parent_width) {
        // if the parent is taller, then the width should be set to fillout the parent
        css(el, {
          'width': parent_widthi + 'px',
        });
      } else {
        css(el, {
          'height': parent_height + 'px',
        });
      }
      css(el, centering);
    });

    $$('.journey-slide').forEach(function(el, idx, array) {
      css(el, update_dict({
        'height': $('#journey').clientHeight + 'px',
        'width': $('#journey').clientWidth + 'px',
      }, centering));
    });

    $$('.journey-p').forEach(function(el, idx, array) {
      css(el, update_dict({
        'margin': '0',
      }, centering));
    });
  };

  var clear_states = function() {
    $('#journey-audio').pause();
    $('#journey-audio').currentTime = 0;
    // TODO: following lines are duplicated code
    current_index = 0;
    current_timeout_id = null;
    is_paused = false;
    is_started = false;
    time_list = [];
    duration_list = [];
  };

  var initSlide = function(element, index, array) {
    //parse duration
    var data = element.dataset;
    duration_list.push(parseInt(data.duration));

    //hide the element
    css(element, {
      'display': 'none'
    })
  };

  var convert_duration_list_to_time_list = function() {
    var audio_length = $('#journey-audio').duration;
    console.log('audio_length: ' + audio_length);
    console.log('duration_list: ' + duration_list);

    //TODO: one iteration is enough for total_time_allocated and num_duration_undefined_slides
    var total_time_allocated = duration_list.reduce(
      function(prev, current) {
        if (prev && current) {
          //the case when the current duration is defined
          return prev + current;
        } else {
          //the case when the current duration is NaN
          return prev || current;
        }
      },
      0
    );
    console.log('total_allocated: ' + total_time_allocated);
    if (total_time_allocated > audio_length) {
      window.alert('The total duration allocated for slides are greater than the length of the audio');
    }

    var num_duration_undefined_slides = duration_list.reduce(
      function(prev, current) {
        if (!current) {
          return prev + 1;
        } else {
          return prev;
        }
      },
      0
    );
    console.log('total num of slides with duration undefined: ' + num_duration_undefined_slides);

    var duration_for_the_rest = (audio_length - total_time_allocated) / num_duration_undefined_slides;
    console.log('duration for the rest: ' + duration_for_the_rest);

    var sum = 0;
    for (var i = 0; i < duration_list.length; ++i) {
      if (duration_list[i]) {
        sum += duration_list[i];
      } else {
        sum += duration_for_the_rest;
      }
      time_list.push(sum);
    }
    console.log('time_list:' + time_list);
  };

  ///////////////////////////////////////////////
  //APIs
  ///////////////////////////////////////////////

  // `init` API which initializes the presentation
  var init = function() {
    console.log('============= init start ===============');
    clear_states();
    init_styles();
    slides = $$('.journey-slide');
    slides.forEach(initSlide);
    convert_duration_list_to_time_list();
    console.log('============== init end ================');
  };

  var play = function() {
    if (!is_started && !is_paused)  {
      play_slide_from(current_index);
      play_audio_from(current_index);
      is_started = true;
    }
  };

  var stop = function() {
    if (is_started) {
      window.clearTimeout(current_timeout_id);
      is_started = false;
      init();
    }
  };

  var resume = function() {
    if (is_paused) {
      resume_audio();
      is_paused = false;
    }
  };

  var pause = function() {
    if (is_started && !is_paused) {
      pause_audio();
      is_paused = true;
    }
  };

  var next = function() {
    if (current_index < slides.length-1) {
      save_current_index = current_index;
      stop();
      display(save_current_index + 1);
    }
  };

  var prev = function() {
    if (current_index > 0) {
      save_current_index = current_index;
      stop();
      display(save_current_index - 1);
    }
  };
  
  //APIs
  window.journey = {
    init: init,
    play: play,
    pause: pause,
    resume: resume,
    stop: stop,
    next: next,
    prev: prev
  };

})(document, window);
