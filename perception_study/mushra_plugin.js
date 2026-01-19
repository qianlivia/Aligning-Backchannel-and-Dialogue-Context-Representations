/**
 *
 * jspsych-survey-mushra
 * mushra-like listening test jspsych plugin
 *
 * adapted from jspsych-survey-multi-choice
 *
 */


jsPsych.plugins['survey-mushra'] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'survey-mushra',
    description: '',
    parameters: {
      audios: {
        type: jsPsych.plugins.parameterType.COMPLEX,
        array: true,
        pretty_name: 'Audios',
        nested: {
          transcript: {
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: 'Transcript',
            default: '',
            description: 'The transcripts will be placed in rows together at the bottom of the page.'
          },
          required: {
            type: jsPsych.plugins.parameterType.BOOL,
            pretty_name: 'Required',
            default: false,
            description: 'Subject will be required to give a rating for this audio. default:true.'
          },
          audio_name: {
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: 'Audio Name',
            default: '',
            description: 'Full audio file path.'
          },
          raw_audio_name: {
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: 'Audio Name',
            default: '',
            description: 'Raw audio file name.'
          }
        }
      },
      context: {
        type: jsPsych.plugins.parameterType.COMPLEX,
        pretty_name: 'Context Audio',
        nested: {
          audio_name: {
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: 'Audio Name',
            default: '',
            description: 'Full audio file path.'
          },
          raw_audio_name: {
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: 'Audio Name',
            default: '',
            description: 'Raw audio file name.'
          }
        }
      },
      options_scale: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Options (rating scale)',
        array: true,
        default: ["5", "4", "3", "2", "1"],
        description: 'Mushra rating options'
      },
      options_sim: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Options (similarity between two clips)',
        array: true,
        default: ["1 and 2", "2 and 3", "1 and 3"],
        description: 'Mushra rating options'
      },
      randomize_audio_order: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Randomize Audio Order',
        default: false,
        description: 'If true, the order of the audios will be randomized. This does not affect recording results.'
      },
      preamble_1: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Preamble',
        default: null,
        description: 'HTML formatted string to display at the top of the page above all the questions.'
      },
      preamble_2: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Preamble',
        default: "Choose answer:",
        description: 'HTML formatted string to display at the top of the page above all the questions.'
      },
      preamble_3: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Preamble',
        default: "Choose answer:",
        description: 'HTML formatted string to display at the top of the page above all the questions.'
      },
      preamble_4: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Preamble',
        default: "Choose answer:",
        description: 'HTML formatted string to display at the top of the page above all the questions.'
      },
      preamble_5: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Preamble',
        default: "Choose answer:",
        description: 'HTML formatted string to display at the top of the page above all the questions.'
      },
      preamble_6: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Preamble',
        default: "Choose answer:",
        description: 'HTML formatted string to display at the top of the page above all the questions.'
      },
      rating_info: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Rating Information',
        default: "5: Extremely &nbsp; 4: Very &nbsp; 3: Moderately &nbsp; 2: Slightly &nbsp; 1: Not at all",
        description: 'HTML formatted string to display at the top of the page above all the questions.'
      },
      transcript: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Transcript All',
        default: null,
        description: 'HTML formatted string to display at the top of the page above all the questions.'
      },
      button_label: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button label',
        default:  'Continue',
        description: 'Label of the continue button.'
      },
      autocomplete: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Allow autocomplete',
        default: false,
        description: "Setting this to true will enable browser auto-complete or auto-fill for the form."
      },
      test_name: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Test name',
        default:  '',
        description: 'Name of test. Will be recorded as part of results.'
      },
    }
  }
  plugin.trial = function(display_element, trial) {

    var plugin_id_name = "jspsych-survey-mushra";

    var html = "";

    // inject CSS for trial
    html += '<style id="jspsych-survey-mushra-css">';
    html += ".jspsych-survey-mushra-question { margin-top: 2em; margin-bottom: 2em; text-align: left; }"+
      "span.required {color: darkred;}"+
      ".jspsych-survey-mushra-horizontal .jspsych-survey-mushra-text {  text-align: center;}"+
      ".jspsych-survey-mushra-option { line-height: 2; }"+
      ".jspsych-survey-mushra-horizontal .jspsych-survey-mushra-option {  display: inline-block;  margin-left: 1em;  margin-right: 1em;  vertical-align: top;}"+
      "label.jspsych-survey-mushra-text input[type='radio'] {margin-right: 1em;}"+
      "\n" +
        "  .column {\n" +
        "    display: inline-block;\n" +
        "    float: none;\n" +
        "    width: 25%;\n" +
        "  }\n" +
        "\n" +
        "  /* Clear floats after the columns */\n" +
        "  .row {padding: 10px;};\n" +
        "  .row:after {\n" +
        "    content: \"\";\n" +
        "    display: table;\n" +
        "    clear: both;\n" +
        "  }";


    html += `
              /* Jumbotron */
              .jumbotron {
                text-align: left;
                font-family: 'Raleway', Helvetica, Arial, sans-serif;
                background-color: #c8c8c8ff;      
                
                color: #272727b3;                 /* soft white text */
                box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                border: 1px solid rgba(0,0,0,0.12);
              }

              /* Container */
              .container {
                margin: 0 auto;
                text-align: center;
              }

              .container .body {
                text-align: center;
              }

              .first {
                padding: 10px;
              }

              /* Jumbotron container override */
              .jumbotron .container {
                max-width: 100%;
                background-color: transparent;   /* avoids double-color block */
              }

              /* Transcript box */
              .jspsych-survey-mushra-transcript {
                padding: 10px;
                text-align: left;
                font-family: 'Raleway', Helvetica, Arial, sans-serif;
                
                /* muted green/teal for better harmony */
                background-color: #626262ff;        
                
                border: 1px solid #0d3227ff;
                border-radius: 4px; 
                color: #fff;                       /* readable on teal */
              }

              /* Next/Submit Button */
              #jspsych-survey-mushra-next-submit {
                background-color: #3e7b4c;        /* professional muted green */
                color: #fff;
                border: none;
                padding: 14px 32px;
                text-align: center;
                text-decoration: none;
                display: inline-block;
                font-size: 15px;
                margin: 24px 12px;
                cursor: pointer;
                border-radius: 4px;               /* softened shape */
                transition: background-color 0.15s ease;
              }

              #jspsych-survey-mushra-next-submit:hover {
                background-color: #366e44;        /* slightly darker on hover */
              
              }

              .mushra-section-header {
                display: flex;
                align-items: center;      /* vertically align button + text */
                justify-content: flex-start; 
                gap: 6px;                 /* small space between arrow and text */
              }

              .mushra-toggle {
                background: none;
                border: none;
                font-size: 22px;
                cursor: pointer;
                padding: 0 6px;
                color: #333;
                user-select: none;
              }

              .mushra-section-body {
                transition: all 0.5s ease;
              }

              .jspsych-btn {
                margin-bottom: 8px;
              }

              .tooltip {
                position: relative;
                display: inline-block;
                border-bottom: 1px dotted black; /* Add dots under the hoverable text */
                cursor: pointer;
              }

              /* Tooltip text */
              .tooltiptext {
                visibility: hidden;
                width: 350px;
                background-color: grey;
                color: #fff;
                text-align: justify;
                border-radius: 6px;
                padding: 15px;
                position: absolute;
                z-index: 1;
              }

              /* Show the tooltip text on hover */
              .tooltip:hover .tooltiptext {
                visibility: visible;
              }
                `

    html += '</style>';


    // List audios
    html += `
      <div class="container">
        <div class="jumbotron first">
    `

    if(trial.preamble_1 !== null){
      html += '<div id="jspsych-survey-mushra-preamble_1" class="jspsych-survey-mushra-preamble"><h2>'+trial.preamble_1+' </h2></div>';
    }

    html += `
    <div style="text-align: center;">
      <audio controls id="context_audio" onloadeddata="this.volume=1.0">
        <source src="${trial.context.audio_name}" type="audio/mpeg">
        Your browser does not support the audio element.
      </audio>
    </div>
    `;


    if(trial.transcript !== null){
      html += `
          <div class="container">
  
      `
      html += '<div id="jspsych-survey-mushra-transcript" class="jspsych-survey-mushra-transcript"> <b>Transcript: </b> '+ trial.transcript+'</div>';
      html += `
      </div>

  `
    }





    // generate audio order. this is randomized here as opposed to randomizing the order of trial.audios
    // so that the data are always associated with the same audio regardless of order
    var audio_order = [];
    for(var i=0; i<trial.audios.length; i++){
      audio_order.push(i);
    }
    if(trial.randomize_audio_order){
      audio_order = jsPsych.randomization.shuffle(audio_order);
    }

    var clicked_play_buttons = new Set()




    html += '<div class="container">'
    html += '<div class="row">'
    for (var i = 0; i < trial.audios.length; i++) {
      html += '<div class="column">'

      var audio = trial.audios[audio_order[i]];
      var audio_id = audio_order[i];

      // create question container
      var question_classes = ['jspsych-survey-mushra-question'];
      if (audio.horizontal) {
        question_classes.push('jspsych-survey-mushra-horizontal');
      }

      html += '<div id="jspsych-'+audio_id+'" class="'+question_classes.join(' ')+'"  data-name="'+audio.raw_audio_name+'">';

      // add question text: default "ver [i]"
      var pretty_i = i+1
      html += '<p class="jspsych-survey-mushra-text survey-mushra">' + '<b>Feedback: '+ pretty_i+ '</b> '
      html += '</p>';
 
       // add play buttons
      html += '<input type="button" data-class="play-btn-here-' + audio_id + '" class="' + plugin_id_name +' jspsych-btn play-btn-here-' + audio_id + '"" value="play"' + '></input> ';

      html += '</div>';
      html += '</div>';
    }

    // show transcripts (if provided)
    html += '<div>'
    for (var i = 0; i < trial.audios.length; i++) {
      var audio = trial.audios[audio_order[i]];
      var pretty_i = i+1;

      if (audio.transcript == '' || audio.transcript == null) {
        continue
      }

      html += '<b>ver '+pretty_i+':</b> ';
      html += audio.transcript
      html += '<br>';
    }
    html += '</div>';

    html += `
        </div>
      </div>

    `
    html += '</div>';
    html += '</div>';
    html += '<hr>';


    html += `
      <div class="container">
        <div class="jumbotron mushra-section-header">
    `
    if(trial.preamble_2 !== null){
      html += `<button type="button" class="mushra-toggle" data-target="preamble2-section">▼</button>`;
      html += '<div id="jspsych-survey-mushra-preamble_2" class="jspsych-survey-mushra-preamble">';
      html += '<h2>' + trial.preamble_2 + '<span class="required">* &nbsp;</span>' +
      '<div class="tooltip">🛈<span class="tooltiptext">' + trial.preamble_2_info + '</span></div>' +
      ' </h2></div>';
    }


    html += '</div>';
    html += '</div>';


    // form element
    if ( trial.autocomplete ) {
      html += '<form id="jspsych-survey-mushra-form">';
    } else {
      html += '<form id="jspsych-survey-mushra-form" autocomplete="off">';
    }

    // Rank audio files based on context matching
    html += '<div class="container mushra-section-body" style="text-align: center;" id="preamble2-section">'

    if(trial.rating_info !== null){
      html += '<div class="jspsych-survey-mushra-rating_info" style="text-align: left;"><h3>'+trial.rating_info+'</h3></div>';
    }

    html += '<div class="row">'
    for (var i = 0; i < trial.audios.length; i++) {
      html += '<div class="column">'

      var audio = trial.audios[audio_order[i]];
      var audio_id = audio_order[i];

      // create question container
      var question_classes = ['jspsych-survey-mushra-question'];
      if (audio.horizontal) {
        question_classes.push('jspsych-survey-mushra-horizontal');
      }

      html += '<div id="jspsych-survey-mushra-'+audio_id+'" class="'+question_classes.join(' ')+'"  data-name="'+audio.raw_audio_name+'">';

      // add question text: default "ver [i]"
      var pretty_i = i+1
      html += '<p class="jspsych-survey-mushra-text survey-mushra">' + '<b>Feedback: '+ pretty_i+ '</b>'
      if(audio.required){
        html += "<span class='required'>*</span>";
      }
      html += '</p>';

      html += '<input type="button" data-class="play-btn-here-' + audio_id + '" class="' + plugin_id_name +' jspsych-btn play-btn-here-' + audio_id + '"" value="play"' + '></input> ';

      // create option radio buttons
      for (var j = 0; j < trial.options_scale.length; j++) {
        // add label and question text
        var option_id_name = "jspsych-survey-mushra-option-"+audio_id+"-"+j;
        var input_name = 'jspsych-survey-mushra-response-'+audio_id;
        var input_id = 'jspsych-survey-mushra-response-'+audio_id+'-'+j;

        var required_attr = audio.required ? 'required' : '';

        // add radio button container
        html += '<div id="'+option_id_name+'" class="jspsych-survey-mushra-option">';
        html += '<label class="jspsych-survey-mushra-text" for="'+input_id+'">';
        html += '<input type="radio" name="'+input_name+'" id="'+input_id+'" value="'+trial.options_scale[j]+'" '+required_attr+'></input>';
        html += trial.options_scale[j]+'</label>';
        html += '</div>';
      }

      html += '</div>';
      html += '</div>';
    }
    html += '</div>';
    html += '</div>';

    html += '<hr>';



    // Choose the best matching audio pair

    html += `
      <div class="container">
        <div class="jumbotron mushra-section-header">
    `
    if(trial.preamble_3 !== null){
      html += `<button type="button" class="mushra-toggle" data-target="preamble3-section">▼</button>`;
      html += '<div id="jspsych-survey-mushra-preamble_3" class="jspsych-survey-mushra-preamble">';
      html += '<h2>' + trial.preamble_3 + '<span class="required">* &nbsp;</span>' +
      '<div class="tooltip">🛈<span class="tooltiptext">' + trial.preamble_3_info + '</span></div>' +
      ' </h2></div>';
    }
    html += '</div>';
    html += '</div>';

    var options = [
      "1_2",
      "2_3",
      "1_3"
    ]
    var options_index = [
      [0, 1],
      [1, 2],
      [0, 2]
    ]
    html += '<div id="jspsych-survey-mushra-best">'
    html += '<div class="container mushra-section-body" style="text-align: center;" id="preamble3-section">'
    html += '<div class="row">';
    var input_name = 'jspsych-survey-mushra-option-best';

    // Single choice - best pair
    for (var i = 0; i < options.length; i++) {
      html += '<div class="column">';

      var option_id = 'jspsych-survey-mushra-option-best-' + options[i];
      var id        = 'jspsych-survey-mushra-response-best-' + options[i];

      var audio1 = trial.audios[audio_order[options_index[i][0]]];
      var audio2 = trial.audios[audio_order[options_index[i][1]]];

      // Match the structure of other sections
      html += '<div id="'+ option_id +'" class="jspsych-survey-mushra-question">';

      html += '<label class="jspsych-survey-mushra-text" for="' + id + '">';
      html += '<input type="radio" name="' + input_name + '" id="' + id + '" ' +
              'value="' + audio1.raw_audio_name + '_' + audio2.raw_audio_name + '" required>';
      html += 'Feedback ' + trial.options_sim[i];
      html += '</label>';

      html += '</div>';   // close question div
      html += '</div>';   // close column
    }
    html += '</div>';     // close row
    html += '</div>';
    html += '</div>';

    html += '<hr>';







    // Energy level rating
    html += `
    <div class="container">
      <div class="jumbotron mushra-section-header">
    `
    if(trial.preamble_4 !== null){
      html += `<button type="button" class="mushra-toggle" data-target="preamble4-section">▼</button>`;
      html += '<div id="jspsych-survey-mushra-preamble_4" class="jspsych-survey-mushra-preamble">';
      html += '<h2>' + trial.preamble_4 + '<span class="required">* &nbsp;</span>' +
      '<div class="tooltip">🛈<span class="tooltiptext">' + trial.preamble_4_info + '</span></div>' +
      ' </h2></div>';
    }
    html += '</div>';
    html += '</div>';


    html += '<div class="container mushra-section-body" style="text-align: center;" id="preamble4-section">'
    if(trial.rating_info !== null){
      html += '<div class="jspsych-survey-mushra-rating_info" style="text-align: left;"><h3>'+trial.rating_info+'</h3></div>';
    }

    html += '<div class="row">'
    for (var i = 0; i < trial.audios.length; i++) {
      html += '<div class="column">'

      var audio = trial.audios[audio_order[i]];
      var audio_id = audio_order[i];

      // create question container
      var question_classes = ['jspsych-survey-mushra-question'];
      if (audio.horizontal) {
        question_classes.push('jspsych-survey-mushra-horizontal');
      }

      html += '<div id="jspsych-survey-mushra-energy-'+audio_id+'" class="'+question_classes.join(' ')+'"  data-name="'+audio.raw_audio_name+'">';

      // add question text: default "ver [i]"
      var pretty_i = i+1
      html += '<p class="jspsych-survey-mushra-text survey-mushra">' + '<b>Feedback: '+ pretty_i+ '</b>'
      if(audio.required){
        html += "<span class='required'>*</span>";
      }
      html += '</p>';

      html += '<input type="button" data-class="play-btn-here-' + audio_id + '" class="' + plugin_id_name +' jspsych-btn play-btn-here-' + audio_id + '"" value="play"' + '></input> ';

      // create option radio buttons
      for (var j = 0; j < trial.options_scale.length; j++) {
        // add label and question text
        var option_id_name = "jspsych-survey-mushra-option-energy-"+audio_id+"-"+j;
        var input_name = 'jspsych-survey-mushra-response-energy-'+audio_id;
        var input_id = 'jspsych-survey-mushra-response-energy-'+audio_id+'-'+j;

        var required_attr = audio.required ? 'required' : '';

        // add radio button container
        html += '<div id="'+option_id_name+'" class="jspsych-survey-mushra-option">';
        html += '<label class="jspsych-survey-mushra-text" for="'+input_id+'">';
        html += '<input type="radio" name="'+input_name+'" id="'+input_id+'" value="'+trial.options_scale[j]+'" '+required_attr+'></input>';
        html += trial.options_scale[j]+'</label>';
        html += '</div>';
      }

      html += '</div>';
      html += '</div>';
    }
    html += '</div>';
    html += '</div>';

    html += '<hr>';






    // Polarity rating
    html += `
    <div class="container">
      <div class="jumbotron mushra-section-header">
    `
    if(trial.preamble_5 !== null){
      html += `<button type="button" class="mushra-toggle" data-target="preamble5-section">▼</button>`;
      html += '<div id="jspsych-survey-mushra-preamble_5" class="jspsych-survey-mushra-preamble">';
      html += '<h2>' + trial.preamble_5 + '<span class="required">* &nbsp;</span>' +
      '<div class="tooltip">🛈<span class="tooltiptext">' + trial.preamble_5_info + '</span></div>' +
      ' </h2></div>';
    }
    html += '</div>';
    html += '</div>';

    html += '<div class="container mushra-section-body" style="text-align: center;" id="preamble5-section">'
    if(trial.rating_info !== null){
      html += '<div class="jspsych-survey-mushra-rating_info" style="text-align: left;"><h3>'+trial.rating_info+'</h3></div>';
    }
    html += '<div class="row">'
    for (var i = 0; i < trial.audios.length; i++) {
      html += '<div class="column">'

      var audio = trial.audios[audio_order[i]];
      var audio_id = audio_order[i];

      // create question container
      var question_classes = ['jspsych-survey-mushra-question'];
      if (audio.horizontal) {
        question_classes.push('jspsych-survey-mushra-horizontal');
      }

      html += '<div id="jspsych-survey-mushra-polarity-'+audio_id+'" class="'+question_classes.join(' ')+'"  data-name="'+audio.raw_audio_name+'">';

      // add question text: default "ver [i]"
      var pretty_i = i+1
      html += '<p class="jspsych-survey-mushra-text survey-mushra">' + '<b>Feedback: '+ pretty_i+ '</b>'
      if(audio.required){
        html += "<span class='required'>*</span>";
      }
      html += '</p>';

      html += '<input type="button" data-class="play-btn-here-' + audio_id + '" class="' + plugin_id_name +' jspsych-btn play-btn-here-' + audio_id + '"" value="play"' + '></input> ';

      // create option radio buttons
      for (var j = 0; j < trial.options_scale.length; j++) {
        // add label and question text
        var option_id_name = "jspsych-survey-mushra-option-polarity-"+audio_id+"-"+j;
        var input_name = 'jspsych-survey-mushra-response-polarity-'+audio_id;
        var input_id = 'jspsych-survey-mushra-response-polarity-'+audio_id+'-'+j;

        var required_attr = audio.required ? 'required' : '';

        // add radio button container
        html += '<div id="'+option_id_name+'" class="jspsych-survey-mushra-option">';
        html += '<label class="jspsych-survey-mushra-text" for="'+input_id+'">';
        html += '<input type="radio" name="'+input_name+'" id="'+input_id+'" value="'+trial.options_scale[j]+'" '+required_attr+'></input>';
        html += trial.options_scale[j]+'</label>';
        html += '</div>';
      }

      html += '</div>';
      html += '</div>';
    }
    html += '</div>';
    html += '</div>';

    html += '<hr>';







    // Surprisal rating
    html += `
    <div class="container">
      <div class="jumbotron mushra-section-header">
    `
    if(trial.preamble_6 !== null){
      html += `<button type="button" class="mushra-toggle" data-target="preamble6-section">▼</button>`;
      html += '<div id="jspsych-survey-mushra-preamble_6" class="jspsych-survey-mushra-preamble">';
      html += '<h2>' + trial.preamble_6 + '<span class="required">* &nbsp;</span>' +
      '<div class="tooltip">🛈<span class="tooltiptext">' + trial.preamble_6_info + '</span></div>' +
      ' </h2></div>';
    }
    html += '</div>';
    html += '</div>';



    html += '<div class="container mushra-section-body" style="text-align: center;" id="preamble6-section">'
    if(trial.rating_info !== null){
      html += '<div class="jspsych-survey-mushra-rating_info" style="text-align: left;"><h3>'+trial.rating_info+'</h3></div>';
    }
    html += '<div class="row">'
    for (var i = 0; i < trial.audios.length; i++) {
      html += '<div class="column">'

      var audio = trial.audios[audio_order[i]];
      var audio_id = audio_order[i];

      // create question container
      var question_classes = ['jspsych-survey-mushra-question'];
      if (audio.horizontal) {
        question_classes.push('jspsych-survey-mushra-horizontal');
      }

      html += '<div id="jspsych-survey-mushra-surprisal-'+audio_id+'" class="'+question_classes.join(' ')+'"  data-name="'+audio.raw_audio_name+'">';

      // add question text: default "ver [i]"
      var pretty_i = i+1
      html += '<p class="jspsych-survey-mushra-text survey-mushra">' + '<b>Feedback: '+ pretty_i+ '</b>'
      if(audio.required){
        html += "<span class='required'>*</span>";
      }
      html += '</p>';

      html += '<input type="button" data-class="play-btn-here-' + audio_id + '" class="' + plugin_id_name +' jspsych-btn play-btn-here-' + audio_id + '"" value="play"' + '></input> ';

      // create option radio buttons
      for (var j = 0; j < trial.options_scale.length; j++) {
        // add label and question text
        var option_id_name = "jspsych-survey-mushra-option-surprisal-"+audio_id+"-"+j;
        var input_name = 'jspsych-survey-mushra-response-surprisal-'+audio_id;
        var input_id = 'jspsych-survey-mushra-response-surprisal-'+audio_id+'-'+j;

        var required_attr = audio.required ? 'required' : '';

        // add radio button container
        html += '<div id="'+option_id_name+'" class="jspsych-survey-mushra-option">';
        html += '<label class="jspsych-survey-mushra-text" for="'+input_id+'">';
        html += '<input type="radio" name="'+input_name+'" id="'+input_id+'" value="'+trial.options_scale[j]+'" '+required_attr+'></input>';
        html += trial.options_scale[j]+'</label>';
        html += '</div>';
      }

      html += '</div>';
      html += '</div>';
    }
    html += '</div>';
    html += '</div>';

    html += '<hr>';







    
    // add submit button
    html += '<input type="submit" id="'+plugin_id_name+'-next-submit" class="'+plugin_id_name+' jspsych-btn"' + (trial.button_label ? ' value="'+trial.button_label + '"': '') + '></input>';
    html += '</form>';


    // render
    display_element.innerHTML = html;
    // Collapsible section toggles
    var toggles = display_element.querySelectorAll('.mushra-toggle');

    toggles.forEach(btn => {
      var target = btn.getAttribute('data-target');
      var section = display_element.querySelector('#' + target);
      if (!section) return;

      btn.addEventListener('click', () => {
        const hidden = section.style.display === 'none';

        section.style.display = hidden ? '' : 'none';
        btn.textContent = hidden ? '▼' : '▶';   // open vs closed arrow
      });
    });

    var play_buttons = []
    var context = jsPsych.pluginAPI.audioContext();
    var audio_player;
    var startTime;     // record webaudio context start time
    startTime = performance.now();

    for (var i = 0; i < trial.audios.length; i++) {
      document.querySelectorAll('.play-btn-here-' + i).forEach(x => {
        x.addEventListener("click", (event) => {
          // event.preventDefault();
          var data_class = event.target.getAttribute("data-class");
          clicked_play_buttons.add(data_class);
          var model_i = data_class.slice(-1);

          if (audio_player != null) {
            if (context === null) {
              audio_player.pause();
            } else {
              audio_player.stop();
            }
          }
          // start time
          jsPsych.pluginAPI.getAudioBuffer(trial.audios[model_i].audio_name)
              .then((buffer) => {
                if (context === null) {
                  audio_player = buffer;
                  audio_player.currentTime = 0;
                } else {
                  audio_player = context.createBufferSource();
                  audio_player.buffer = buffer;
                  audio_player.connect(context.destination);
                }

                // start audio
                if (context === null) {
                  audio_player.play();
                } else {
                  startTime = context.currentTime;
                  audio_player.start(startTime);
                }
              })
              .catch((err) => {
                console.error(`Failed to load audio file. Try checking the file path. We recommend using the preload plugin to load audio files.`)
                console.error(err)
              });
        })
        play_buttons.push(x);
      });
    }

    // Check if the context audio was played
    document.getElementById('context_audio').addEventListener("play", function (event) {
      clicked_play_buttons.add(event.target.getAttribute("id"));
    });

    // var y = document.getElementById("jspsych-survey-mushra-next-submit")
    document.querySelector('form').addEventListener('submit', (event) => {
    // y.addEventListener("click", function(event) {
      event.preventDefault();

      // measure response time
      var endTime = performance.now();
      var response_time = endTime - startTime;


      // Listen to all
      const total_required_audios = trial.audios.length + 1; 

      // 2. Check if all required audios have been played
      if (clicked_play_buttons.size < total_required_audios) {
          window.alert("Please listen to the context audio and all comparison audios before continuing.");
          return;
      }
      
      // create object to hold responses
      var response_data = {};
      for(var i=0; i<trial.audios.length; i++){
        var match = display_element.querySelector('#jspsych-survey-mushra-'+i);
        var id = "audio" + i;
        if(match.querySelector("input[type=radio]:checked") !== null){
          var val = match.querySelector("input[type=radio]:checked").value;
        } else {
          window.alert("You must choose all options.")
          // return;
          var val = "";
        }
        var obje = {};
        var name = id;
        obje[name] = val;
        Object.assign(response_data, obje);
      }

      // create object to hold new responses --by Shivam
      let response_new = {};
      for(var i=0; i<trial.audios.length; i++){
        var match = display_element.querySelector('#jspsych-survey-mushra-'+i);
        let raw_audio_name = trial.audios[i].raw_audio_name;
        if(match.querySelector("input[type=radio]:checked") !== null){
          var val = match.querySelector("input[type=radio]:checked").value;
        } else {
          window.alert("You must choose all options.")
          // return;
          var val = "";
        }
        var obje = {};
        obje[raw_audio_name] = val;
        Object.assign(response_new, obje);
      }


      // create object to hold best
      var match = display_element.querySelector('#jspsych-survey-mushra-best');
      if(match.querySelector("input[type=radio]:checked") !== null){
        var best = match.querySelector("input[type=radio]:checked").value;
      } else {
        window.alert("must choose all options")
        // return;
        var best = "";
      }

      var other_answers = {};
      const answer_types = ["energy", "polarity", "surprisal"];

      for(var i=0; i<trial.audios.length; i++){
        var obje = {};
        let raw_audio_name = trial.audios[i].raw_audio_name;

        for (var a of answer_types) {
          var match = display_element.querySelector('#jspsych-survey-mushra-' + a + "-" + i);
          if(match.querySelector("input[type=radio]:checked") !== null){
            var val = match.querySelector("input[type=radio]:checked").value;
          } else {
            window.alert("You must choose all options.")
            // return;
            var val = "";
          }
          obje[a] = val;
        }
        other_answers[raw_audio_name] = obje; 
      }



      // save data
      var trial_data = {
        rt: response_time,
        response: response_data,
        response_new: response_new,
        audios: trial.audios,
        audio_order: audio_order,
        test_name: trial.test_name,
        best: best,
        other_answers: other_answers,
        clicked_play_buttons: Array.from(clicked_play_buttons), // which files they have listened to
        context: trial.context.raw_audio_name, // context
      };
      display_element.innerHTML = '';


      // stop audio
      if (audio_player != null) {
          if (context !== null) {
            audio_player.stop();
          } else {
            audio_player.pause();
          }
        }

      // next trial
      jsPsych.finishTrial(trial_data);
    });
  };

  return plugin;
})();