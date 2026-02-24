function get_trial_block(context, files, ind, transcript) {
  const audios = [];
  
  for (const file of files) {
    audios.push({audio_name: file, required: true, raw_audio_name: file.split('/').slice(-1)[0]});
  }
  const context_obj = {audio_name: context, required: true, raw_audio_name: context.split('/').slice(-1)[0]};

   return {
      type: 'survey-mushra',
      preamble_1: 'Listen to the context and the feedback responses. The feedback responses are repeated at the beginning of each question where you have to rate them individually.',

      preamble_2: '#1: Please rate the feedback responses based on how well they match the context (min: 1, max: 5).',
      preamble_2_info: "Here, you might want to consider the overall impression you get from each feedback response, including both the content and the tone. Is it appropriate? Expected? Is it how a regular person would react? Does it align with the context provided? In the example case we discussed before, the context was about residents in a nursing home passing away due to various symptoms. Feedback responses that acknowledge the gravity of the situation or express sympathy would likely rate higher in matching the context, while responses that seem indifferent or unrelated would rate lower. Expressing happiness, enthusiasm or casual agreement might not align well with the serious nature of the context. Note that in this part of the task, you shouldn't give relatively scoring, that is, your judgment should <b>not</b> be based on how the different feedback responses compare to each other.",

      preamble_3: '#2: Choose the two responses that are the most similar to each other.',
      preamble_3_info: "Here, think about which two feedback responses would be interchangeable, with the least possibility of changing the meaning or the message. For example, if you swapped Feedback 2 and Feedback 3, would it still make sense? How about swapping Feedback 1 with Feedback 3? Or Feedback 1 and 2? You will most likely choose two responses that were assigned similar scores in the previous question. Note: They don't have to be the ones with the highest score!",

      preamble_4: '#3: Rate the energy level: how energetic is the response (min: 1, max: 5)?',
      preamble_4_info: "Here, think about how extreme the emotions are, how loudly the feedback speaker speaks, how much effort is put into the response, and how energetic, enthusiastic, upset, irritated, etc. the speaker sounds. A very energetic speaker might speak loudly, with a lot of intonation and variation in pitch, and with a fast pace. A low-energy speaker might speak softly, in a monotone voice, and with a slow pace. The length of the response might vary. Note that energy level is usually independent of the content of what is being said. For example, someone can say \"ugh\" in a very energetic way (e.g., loudly and with a lot of intonation) or in a very low-energy way (e.g., softly and in a monotone voice).",

      preamble_5: '#4: Rate polarity: how positive is the response (min: 1, max: 5)?',
      preamble_5_info: "Polarity refers to whether the feedback response is positive, negative, or neutral in sentiment. A positive response expresses agreement, happiness, or approval; a negative response conveys disagreement, sadness, or disapproval; and a neutral response is neither positive nor negative. For example, \"exactly\" and \"right\" are generally positive responses as they indicate agreement.",

      preamble_6: '#5: Rate surprisal: how surprised does the feedback speaker sound (min: 1, max: 5)?',
      preamble_6_info: "Surprisal refers to the degree of surprise or astonishment expressed in the feedback response. A high surprisal rating indicates that the speaker sounds very surprised, while a low rating suggests that the speaker is not surprised at all, or worse, bored.",

      transcript: transcript,
      test_name: ind,
      context: context_obj,
      audios: audios,
      randomize_audio_order: true
   };
}

function get_trial_attention(context, files, ind, transcript) {
  const audios = [];

  files.forEach((file, index) => {
    audios.push({audio_name: file, required: true, raw_audio_name: file.split('/').slice(-1)[0] + "_" + index});
  });
  const context_obj = {audio_name: context, required: true, raw_audio_name: context.split('/').slice(-1)[0]};

   return {
      type: 'survey-mushra',
      preamble_1: 'Listen to the context and the feedback responses. The feedback responses are repeated at the beginning of each question where you have to rate them individually.',

      preamble_2: '#1: Please rate the feedback responses based on how well they match the context.',
      preamble_2_info: "Here, you might want to consider the overall impression you get from each feedback response, including both the content and the tone. Is it appropriate? Expected? Is it how a regular person would react? Does it align with the context provided? In the example case we discussed before, the context was about residents in a nursing home passing away due to various symptoms. Feedback responses that acknowledge the gravity of the situation or express sympathy would likely rate higher in matching the context, while responses that seem indifferent or unrelated would rate lower. Expressing happiness, enthusiasm or casual agreement might not align well with the serious nature of the context. Note that in this part of the task, you shouldn't give relatively scoring, that is, your judgment should <b>not</b> be based on how the different feedback responses compare to each other.",

      preamble_3: '#2: Choose the two responses that are the same.',
      preamble_3_info: "Here, think about which two feedback responses would be interchangeable, with the least possibility of changing the meaning or the message. For example, if you swapped Feedback 2 and Feedback 3, would it still make sense? How about swapping Feedback 1 with Feedback 3? Or Feedback 1 and 2? You will most likely choose two responses that were assigned similar scores in the previous question. Note: They don't have to be the ones with the highest score!",

      preamble_4: '#3: Rate the energy level: how energetic is the response? (Choose "4".)',
      preamble_4_info: "Here, think about how extreme the emotions are, how loudly the feedback speaker speaks, how much effort is put into the response, and how energetic, enthusiastic, upset, irritated, etc. the speaker sounds. A very energetic speaker might speak loudly, with a lot of intonation and variation in pitch, and with a fast pace. A low-energy speaker might speak softly, in a monotone voice, and with a slow pace. The length of the response might vary. Note that energy level is usually independent of the content of what is being said. For example, someone can say \"ugh\" in a very energetic way (e.g., loudly and with a lot of intonation) or in a very low-energy way (e.g., softly and in a monotone voice).",

      preamble_5: '#4: Rate polarity: how positive is the response? (Choose "1".)',
      preamble_5_info: "Polarity refers to whether the feedback response is positive, negative, or neutral in sentiment. A positive response expresses agreement, happiness, or approval; a negative response conveys disagreement, sadness, or disapproval; and a neutral response is neither positive nor negative. For example, \"exactly\" and \"right\" are generally positive responses as they indicate agreement.",

      preamble_6: '#5: Rate surprisal: how surprised does the feedback speaker sound? (Choose "3".)',
      preamble_6_info: "Surprisal refers to the degree of surprise or astonishment expressed in the feedback response. A high surprisal rating indicates that the speaker sounds very surprised, while a low rating suggests that the speaker is not surprised at all, or worse, bored.",

      transcript: transcript,
      test_name: ind,
      context: context_obj,
      audios: audios,
      randomize_audio_order: true
   };
}

function choose(n_elements, choose_n_elements=2) {
  // Return an array of choose_n_elements unique random integers from 0 to n_elements-1
  if (choose_n_elements > n_elements) {
    throw new Error("Cannot choose more elements than available");
  }
  const chosen = [];
  while (chosen.length < choose_n_elements) {
    const random = Math.floor(Math.random() * n_elements);
    if (!chosen.includes(random)) {
      chosen.push(random);
    }
  }
  return chosen;
}

function sampleWithoutReplacement(arr, n) {
  if (n > arr.length) {
    throw new Error("Cannot pick more elements than available");
  }

  // Make a copy so we don't mutate the original
  let copy = [...arr];

  // Fisher–Yates shuffle
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy.slice(0, n);
}

/*****************
 *****************
    Configurations
 *****************
******************/
const prefix = "https://cdn.jsdelivr.net/gh/qianlivia/perception_study@master/";
const attn_prefix = "https://cdn.jsdelivr.net/gh/qianlivia/perception_study@5168b9d/";
const data_folder = "triad2";
const attention_folder = "attention";
const file_names = ["context.wav", "data.json", "fb0.wav", "fb1.wav", "fb2.wav"];

const attention_check_options_raw = [
  "attn1", "attn2"
];

const attention_check_files = attention_check_options_raw.map(e => {
  return [
    attn_prefix + attention_folder + "/" + e + "/" + file_names[0],
    attn_prefix + attention_folder + "/" + e + "/" + file_names[1],
    [
      attn_prefix + attention_folder + "/" + e + "/" + file_names[2],
      attn_prefix + attention_folder + "/" + e + "/" + file_names[3],
      attn_prefix + attention_folder + "/" + e + "/" + file_names[4]
    ]
  ];
});

/*****************
 *****************
    End Configurations
 *****************
******************/

const feedback_options_raw = [
 'fe_03_02850_0_593',
 'fe_03_04516_1_197',
 'fe_03_03080_0_150',
 'fe_03_02930_0_592',
 'fe_03_05392_0_461',
 'fe_03_03640_0_440',
 'fe_03_01928_0_593',
 'fe_03_02302_1_367',
 'fe_03_03650_0_100',
 'fe_03_00285_1_405',
 'fe_03_04838_1_439',
 'fe_03_02870_0_471',
 'fe_03_03978_1_105',
 'fe_03_01541_1_310',
 'fe_03_00140_1_510',
 'fe_03_02650_1_528',
 'fe_03_01474_0_229',
 'fe_03_04922_1_262',
 'fe_03_03435_1_77',
 'fe_03_00619_1_235',
 'fe_03_04065_1_47',
 'fe_03_00202_1_506',
 'fe_03_03656_1_199',
 'fe_03_05303_0_37',
 'fe_03_03100_0_55',
 'fe_03_04168_1_336',
 'fe_03_05788_1_122',
 'fe_03_00213_1_315',
 'fe_03_03132_0_104',
 'fe_03_05175_1_479',
 'fe_03_03570_0_214',
 'fe_03_00445_1_237',
 'fe_03_03200_0_426',
 'fe_03_00221_0_146',
 'fe_03_02059_0_423',
 'fe_03_00339_0_712',
 'fe_03_03369_0_396',
 'fe_03_02355_0_463',
 'fe_03_05386_0_387',
 'fe_03_05182_0_284',
 'fe_03_02975_1_333',
 'fe_03_04749_0_154',
 'fe_03_01742_0_483',
 'fe_03_03348_0_119',
 'fe_03_00332_1_329',
 'fe_03_05644_1_55',
 'fe_03_05713_1_470',
 'fe_03_01574_0_145',
 'fe_03_00975_0_270',
 'fe_03_03975_0_532',
 'fe_03_00395_0_581',
 'fe_03_05079_1_545',
 'fe_03_05630_0_393',
 'fe_03_01457_0_409',
 'fe_03_01570_0_424',
 'fe_03_03172_0_95',
 'fe_03_02892_0_184',
 'fe_03_04896_1_131',
 'fe_03_03928_0_77',
 'fe_03_00892_0_81',
 'fe_03_04542_0_595',
 'fe_03_03331_1_248',
 'fe_03_01293_1_470',
 'fe_03_04587_0_360',
 'fe_03_00272_1_324',
 'fe_03_05820_0_590',
 'fe_03_05112_0_174',
 'fe_03_04929_1_33',
 'fe_03_03677_0_445',
 'fe_03_03845_1_224',
 'fe_03_04196_1_28',
 'fe_03_05758_0_213',
 'fe_03_01531_0_259',
 'fe_03_05251_0_152',
 'fe_03_00999_1_478',
 'fe_03_00712_1_418',
 'fe_03_03541_0_325',
 'fe_03_00633_1_509',
 'fe_03_05725_0_175',
 'fe_03_03988_0_524',
 'fe_03_00484_0_52',
 'fe_03_04252_0_112',
 'fe_03_00621_1_418',
 'fe_03_02356_1_85',
 'fe_03_04203_1_409',
 'fe_03_02814_1_375',
 'fe_03_04254_0_81',
 'fe_03_01949_0_142',
 'fe_03_02536_1_502',
 'fe_03_00776_1_58',
 'fe_03_05111_0_225',
 'fe_03_02924_0_440',
 'fe_03_04877_1_384',
 'fe_03_03997_1_362',
 'fe_03_00134_1_325',
 'fe_03_00774_1_557',
 'fe_03_04387_0_441',
 'fe_03_01996_0_262',
 'fe_03_04287_0_389',
 'fe_03_02482_1_68',
 'fe_03_03315_0_104',
 'fe_03_02563_1_161',
 'fe_03_05095_1_481',
 'fe_03_00355_1_498',
 'fe_03_03444_0_132',
 'fe_03_00263_1_17',
 'fe_03_03538_1_22',
 'fe_03_05279_0_26',
 'fe_03_02572_0_353',
 'fe_03_03893_1_235',
 'fe_03_02032_1_51',
 'fe_03_04937_0_375',
 'fe_03_01695_1_300',
 'fe_03_02392_1_462',
 'fe_03_02236_0_223',
 'fe_03_02358_1_275',
 'fe_03_00201_1_487',
 'fe_03_03937_0_540',
 'fe_03_04354_0_415',
 'fe_03_03539_1_514',
 'fe_03_00270_0_411',
 'fe_03_05005_1_36',
 'fe_03_02682_1_50',
 'fe_03_04638_1_594',
 'fe_03_02474_0_406',
 'fe_03_05112_1_380',
 'fe_03_02478_1_92',
 'fe_03_02795_0_207',
 'fe_03_05170_1_134',
 'fe_03_04305_0_161',
 'fe_03_04422_0_391',
 'fe_03_01465_1_478',
 'fe_03_00939_1_258',
 'fe_03_02479_0_45',
 'fe_03_04477_0_279',
 'fe_03_01911_1_92',
 'fe_03_00431_0_271',
 'fe_03_04376_1_528',
 'fe_03_03789_1_20',
 'fe_03_03335_0_153',
 'fe_03_02933_0_505',
 'fe_03_04780_1_454',
 'fe_03_01272_0_257',
 'fe_03_05169_0_346',
 'fe_03_04684_0_485',
 'fe_03_03177_1_233',
 'fe_03_04673_0_61',
 'fe_03_03534_0_496',
 'fe_03_02667_1_197',
 'fe_03_00119_0_502',
 'fe_03_02612_1_65',
 'fe_03_01854_0_209',
 'fe_03_04300_0_480',
 'fe_03_04287_0_455',
 'fe_03_01854_0_41',
 'fe_03_03549_0_168',
 'fe_03_04457_1_155',
 'fe_03_00629_0_33',
 'fe_03_01345_0_307',
 'fe_03_01691_1_126',
 'fe_03_01397_1_343',
 'fe_03_02066_0_598',
 'fe_03_05233_0_358',
 'fe_03_05262_1_49',
 'fe_03_05778_1_168',
 'fe_03_05803_0_316',
 'fe_03_00573_1_263',
 'fe_03_04519_1_389',
 'fe_03_01104_0_309',
 'fe_03_05337_1_336',
 'fe_03_02894_0_527',
 'fe_03_03462_0_350',
 'fe_03_02728_0_576',
 'fe_03_00697_0_456',
 'fe_03_04296_0_194',
 'fe_03_02202_1_172',
 'fe_03_00771_0_505',
 'fe_03_04599_0_275',
 'fe_03_04836_0_199',
 'fe_03_02178_0_129',
 'fe_03_05191_0_379',
 'fe_03_02073_1_76',
 'fe_03_02206_0_164',
 'fe_03_01184_0_534',
 'fe_03_04444_1_593',
 'fe_03_05471_0_43',
 'fe_03_03494_1_501',
 'fe_03_05345_1_279',
 'fe_03_02494_1_366',
 'fe_03_03035_1_281',
 'fe_03_05014_1_59',
 'fe_03_03671_0_584',
 'fe_03_05499_1_243',
 'fe_03_03461_0_433',
 'fe_03_01933_0_76',
 'fe_03_04016_0_48',
 'fe_03_03927_0_403',
 'fe_03_05793_1_131',
 'fe_03_02656_1_538',
 'fe_03_01244_0_152',
 'fe_03_05196_0_314',
 'fe_03_04269_1_117',
 'fe_03_03894_0_334',
 'fe_03_04368_1_110',
 'fe_03_05431_1_157',
 'fe_03_01143_0_296',
 'fe_03_00011_0_67',
 'fe_03_04087_0_112',
 'fe_03_03032_1_152',
 'fe_03_01465_1_254',
 'fe_03_01623_0_298',
 'fe_03_04805_1_557',
 'fe_03_02469_1_121',
 'fe_03_04879_1_438',
 'fe_03_05497_0_551',
 'fe_03_04411_1_179',
 'fe_03_03624_1_500',
 'fe_03_04134_0_552',
 'fe_03_04201_1_313',
 'fe_03_01145_1_117',
 'fe_03_01425_1_386',
 'fe_03_03790_1_340',
 'fe_03_01443_0_283',
 'fe_03_01960_1_454',
 'fe_03_04943_1_540',
 'fe_03_03430_0_290',
 'fe_03_00629_0_48',
 'fe_03_03615_0_499',
 'fe_03_02251_0_443',
 'fe_03_04065_1_529',
 'fe_03_03016_1_532',
 'fe_03_05729_0_17',
 'fe_03_03220_0_267',
 'fe_03_01271_0_294',
 'fe_03_00735_0_22',
 'fe_03_05293_1_136',
 'fe_03_03251_1_478',
 'fe_03_01194_0_594',
 'fe_03_01523_1_426',
 'fe_03_05710_1_23',
 'fe_03_05627_1_577',
 'fe_03_03445_0_549',
 'fe_03_02086_0_41',
 'fe_03_02716_0_585',
 'fe_03_00041_1_322',
 'fe_03_03002_1_327',
 'fe_03_02073_0_259',
 'fe_03_03656_1_428',
 'fe_03_02346_1_516',
 'fe_03_00484_0_519',
 'fe_03_05208_0_564',
 'fe_03_02251_1_38',
 'fe_03_01701_0_382',
 'fe_03_05069_0_301',
 'fe_03_04250_1_32',
 'fe_03_01247_1_21',
 'fe_03_04578_0_50',
 'fe_03_03657_1_438',
 'fe_03_02143_1_270',
 'fe_03_03955_0_192',
 'fe_03_00339_0_115',
 'fe_03_05825_1_100',
 'fe_03_05143_0_369',
 'fe_03_05045_1_105',
 'fe_03_03571_1_584',
 'fe_03_05733_0_553',
 'fe_03_04565_1_52',
 'fe_03_00507_1_479',
 'fe_03_00360_1_491',
 'fe_03_01562_1_587',
 'fe_03_01783_1_65',
 'fe_03_00368_0_409',
 'fe_03_04230_0_514',
 'fe_03_01281_1_197',
 'fe_03_04950_1_436',
 'fe_03_00401_0_560',
 'fe_03_04836_0_189',
 'fe_03_03329_0_75',
 'fe_03_04696_1_78',
 'fe_03_03329_0_244',
 'fe_03_00263_1_173',
 'fe_03_05584_1_368',
 'fe_03_05602_1_116',
 'fe_03_04480_1_44',
 'fe_03_03640_0_251',
 'fe_03_02043_1_519',
 'fe_03_00699_0_594',
 'fe_03_00666_1_180',
 'fe_03_01970_0_200',
 'fe_03_01678_0_40',
 'fe_03_02712_1_124',
 'fe_03_03508_1_545',
 'fe_03_04133_1_597',
 'fe_03_03282_0_474',
 'fe_03_04547_1_568',
 'fe_03_00025_0_604',
 'fe_03_02172_1_33',
 'fe_03_05030_0_488',
 'fe_03_01276_0_251',
 'fe_03_04209_0_350',
 'fe_03_05653_0_302',
 'fe_03_00122_1_440',
 'fe_03_02967_1_395',
 'fe_03_02556_0_39',
 'fe_03_01413_0_178',
 'fe_03_03610_1_517',
 'fe_03_02236_1_22',
 'fe_03_02052_1_64',
 'fe_03_01411_0_332',
 'fe_03_03596_1_431',
 'fe_03_04205_1_573',
 'fe_03_04087_1_391',
 'fe_03_01540_1_134',
 'fe_03_00862_0_214',
 'fe_03_03200_0_487',
 'fe_03_02669_1_483',
 'fe_03_02467_0_38',
 'fe_03_03713_0_174',
 'fe_03_00244_0_555',
 'fe_03_05243_1_172',
 'fe_03_03917_1_182',
 'fe_03_01989_1_191',
 'fe_03_00588_0_347',
 'fe_03_01397_0_227',
 'fe_03_04441_1_543',
 'fe_03_05409_1_520',
 'fe_03_04888_0_414',
 'fe_03_05553_1_380',
 'fe_03_05802_1_398',
 'fe_03_00343_1_546',
 'fe_03_05672_1_485',
 'fe_03_05500_0_111',
 'fe_03_02994_1_98',
 'fe_03_03931_1_483',
 'fe_03_02800_1_235',
 'fe_03_00563_0_122',
 'fe_03_00177_0_231',
 'fe_03_01541_0_87',
 'fe_03_03089_1_390',
 'fe_03_00715_1_108',
 'fe_03_03388_1_48',
 'fe_03_03206_0_586',
 'fe_03_00461_1_471',
 'fe_03_01010_0_290',
 'fe_03_03031_0_596',
 'fe_03_02607_0_555',
 'fe_03_04924_1_189',
 'fe_03_00092_0_209',
 'fe_03_03991_1_179',
 'fe_03_00225_1_186',
 'fe_03_03372_0_68',
 'fe_03_01642_1_93',
 'fe_03_04791_0_477',
 'fe_03_00631_1_373',
 'fe_03_03122_1_372',
 'fe_03_01340_0_463',
 'fe_03_05775_0_35',
 'fe_03_02417_0_384',
 'fe_03_01357_1_553',
 'fe_03_00606_1_21',
 'fe_03_05138_0_535',
 'fe_03_05667_1_367',
 'fe_03_01498_1_202',
 'fe_03_02995_0_328',
 'fe_03_04041_1_343',
 'fe_03_05128_1_239',
 'fe_03_03329_0_427',
 'fe_03_05311_1_146',
 'fe_03_03016_1_285',
 'fe_03_04502_0_462',
 'fe_03_02860_0_317',
 'fe_03_01818_0_62',
 'fe_03_02740_1_530',
 'fe_03_03377_1_181',
 'fe_03_03235_0_135',
 'fe_03_02017_0_310',
 'fe_03_01948_1_246',
 'fe_03_03629_0_76',
 'fe_03_04537_1_255',
 'fe_03_01983_0_346',
 'fe_03_00363_0_129',
 'fe_03_05734_1_37',
 'fe_03_01294_0_210',
 'fe_03_00821_1_183',
 'fe_03_01970_0_228',
 'fe_03_01262_1_498',
 'fe_03_03231_1_432',
 'fe_03_00652_0_321',
 'fe_03_05080_1_98',
 'fe_03_05443_0_501',
 'fe_03_01737_1_588',
 'fe_03_04493_0_64',
 'fe_03_01204_1_477',
 'fe_03_00193_1_118',
 'fe_03_03644_0_74',
 'fe_03_05048_1_206',
 'fe_03_01699_1_564',
 'fe_03_03592_0_367',
 'fe_03_02545_1_571',
 'fe_03_00294_0_265',
 'fe_03_01494_1_258',
 'fe_03_01164_1_112',
 'fe_03_05048_1_407',
 'fe_03_03713_0_592',
 'fe_03_00300_0_106',
 'fe_03_03652_0_258',
 'fe_03_04474_0_204',
 'fe_03_02032_1_151',
 'fe_03_03744_0_40',
 'fe_03_04829_0_482',
 'fe_03_04406_0_472',
 'fe_03_01919_1_494',
 'fe_03_02267_0_150',
 'fe_03_01708_0_169',
 'fe_03_05612_0_192',
 'fe_03_00191_0_170',
 'fe_03_02622_1_405',
 'fe_03_04692_1_485',
 'fe_03_03741_0_201',
 'fe_03_05259_1_357'
];


const feedback_files = feedback_options_raw.map(e => {
  return [
    prefix + data_folder + "/" + e + "/" + file_names[0],
    prefix + data_folder + "/" + e + "/" + file_names[1],
    [
      prefix + data_folder + "/" + e + "/" + file_names[2],
      prefix + data_folder + "/" + e + "/" + file_names[3],
      prefix + data_folder + "/" + e + "/" + file_names[4]
    ]
  ];
});

async function getTranscript(url) {
  try {
    // 1. Fetch the data from the specified URL
    const response = await fetch(url);

    // Check if the request was successful
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // 2. Parse the response body as JSON. This automatically converts 
    // the JSON string into a JavaScript object (which is the equivalent of a Python dictionary).
    const data = await response.json();

    // 3. Get the value of the "attention_check_files" key
    const attentionCheckValue = data.context_text;

    // Log or return the value
    return attentionCheckValue;

  } catch (error) {
    // 4. Handle any errors during the fetch or parsing process
    console.error("Could not fetch or parse JSON:", error);
    return null; 
  }
}

(async () => {

const num_attention_checks = attention_check_options_raw.length; // 2
const num_files = 21;
const num_sets = 20;
const num_stimuli_set = num_files + num_attention_checks;

const timeline = [];
const attention_check_indices = choose(num_stimuli_set, num_attention_checks);
const sample_set = Math.floor(Math.random() * num_sets);

const start = sample_set * num_files;
const end = start + num_files;

const subset = feedback_files.slice(start, end);


var i_attn = 0;
var i_sample = 0;

for (let i = 0; i < num_stimuli_set; i++) {
  if (attention_check_indices.includes(i)) {
    timeline.push(get_trial_attention(
      attention_check_files[i_attn][0],
      attention_check_files[i_attn][2],
      i,
      await getTranscript(attention_check_files[i_attn][1])
    ));
    i_attn++;
  } else {
    
    timeline.push(get_trial_block(
      subset[i_sample][0],
      subset[i_sample][2],
      i,
      await getTranscript(subset[i_sample][1])
    ));
    i_sample++;
  }
}

/*****************
 *****************
  Profilic Information 
 *****************
******************/

const subject_id = jsPsych.data.getURLVariable('PROLIFIC_PID');
const study_id = jsPsych.data.getURLVariable('STUDY_ID');
const session_id = jsPsych.data.getURLVariable('SESSION_ID');

jsPsych.data.addProperties({
  subject_id: subject_id,
  study_id: study_id,
  session_id: session_id,
  sample_set: sample_set
});

/*****************
 *****************
    End Prolific Information
 *****************
******************/


/*****************
 *****************
    Experiment Design
 *****************
******************/

const end_test = {
  type: 'html-keyboard-response',
  stimulus: `<p>You've completed the test. Thank you for participating!</p>
  <p>Press any key to return to Prolific and complete the study</p>`
};

const inital_confirm_headphones = {
    type: 'html-button-response',
    stimulus: '<h2> Are you using headphones right now? </h2>',
    choices: ['Yes', 'No'],
    prompt: ""
};

const confirm_headphones = {
    type: 'html-button-response',
    stimulus: '<h2> Were you wearing <b> headphones </b> for the <b>entire duration </b> of this test? </h2>',
    choices: ['Yes', 'No'],
    prompt: ""
};

const feedback_for_test = {
  type: 'survey-html-form',
  preamble: '<h1>What are your thoughts about the test?</h1>',
  html: '<p> <textarea id="test-resp-box" name="response" cols="100" rows="5"></textarea></p>',
  autofocus: 'test-resp-box'
};

const example_clips_1 = {
  type: 'survey-html-form',
  preamble: '<h2> Example Clips </h2>',
  html: `<style>
    p { text-align: justify; }
    table, th, td {
      border: 1px solid black;
      border-collapse: collapse;
      padding: 10px;
    }
    </style>
  <p> Here, we show one context file and seven feedback files. Note that these samples are not from the actual dataset and the feedback responses are exaggerated. Still, they should give you some idea of what to expect.</p>
  <hr>
  <div style="text-align: left;">
    <p><b>Context Clip:</b></p>
        <audio controls id="context_audio" onloadeddata="this.volume=1.0">
          <source src="https://cdn.jsdelivr.net/gh/qianlivia/perception_study@master/selected_context/1051ef33-9361-41e2-89d9-46d4eb851508_B_2649090_2650110.wav" type="audio/mpeg">
          Your browser does not support the audio element.
        </audio>
    <p><b>Transcript:</b> as the symptoms differ so it went through our nursing home and actually ten of our residents died</p>
  </div>
  <hr>
  <div style="text-align: left;">
    <table style="border-collapse: collapse; text-align: center;">
      <tr>
        <th>Feedback 1:</th>
        <th>Feedback 2:</th>
        <th>Feedback 3:</th>
        <th>Feedback 4:</th>
        <th>Feedback 5:</th>
        <th>Feedback 6:</th>
        <th>Feedback 7:</th>
      </tr>

      <tr>
        <td>
          <audio controls style="width: 100px;" onloadeddata="this.volume=1.0">
            <source src="https://cdn.jsdelivr.net/gh/qianlivia/perception_study@master/selected_feedback_clipped_rms-30_unique/sun_041_exactly.wav" type="audio/mpeg">
          </audio>
        </td>

        <td>
          <audio controls style="width: 100px;" onloadeddata="this.volume=1.0">
            <source src="https://cdn.jsdelivr.net/gh/qianlivia/perception_study@master/selected_feedback_clipped_rms-30_unique/sun_045_yeah.wav" type="audio/mpeg">
          </audio>
        </td>

        <td>
          <audio controls style="width: 100px;" onloadeddata="this.volume=1.0">
            <source src="https://cdn.jsdelivr.net/gh/qianlivia/perception_study@master/selected_feedback_clipped_rms-30_unique/NR_084_no.wav" type="audio/mpeg">
          </audio>
        </td>

        <td>
          <audio controls style="width: 100px;" onloadeddata="this.volume=1.0">
            <source src="https://cdn.jsdelivr.net/gh/qianlivia/perception_study@master/selected_feedback_clipped_rms-30_unique/NegS_020_ugh.wav" type="audio/mpeg">
          </audio>
        </td>

        <td>
          <audio controls style="width: 100px;" onloadeddata="this.volume=1.0">
            <source src="https://cdn.jsdelivr.net/gh/qianlivia/perception_study@master/selected_feedback_clipped_rms-30_unique/sun1_033_right.wav" type="audio/mpeg">
          </audio>
        </td>

        <td>
        <audio controls style="width: 100px;" onloadeddata="this.volume=1.0">
                <source src="https://cdn.jsdelivr.net/gh/qianlivia/perception_study@master/selected_feedback_clipped_rms-30_unique/NR_004_no.wav" type="audio/mpeg">
        </audio> 
        </td>
        
        <td>
        <audio controls style="width: 100px;" onloadeddata="this.volume=1.0">
                <source src="https://cdn.jsdelivr.net/gh/qianlivia/perception_study@master/selected_feedback_clipped_rms-30_unique/PS_107_wow.wav" type="audio/mpeg">
        </audio>
        </td>
      </tr>

      <tr>
        <td>exactly</td>
        <td>yeah</td>
        <td>no</td>
        <td>ugh</td>
        <td>right</td>
        <td>no</td>
        <td>wow</td>
      </tr>
    </table>
    <p>The following pages contain the detailed ratings for each feedback response, and the reasoning behind them. Please read them carefully. <b>There is a summary on the last page.</b></p>

  </div>
  <hr>
  <hr>
  <div style="text-align: left;">
  <p><b>Question 1: Please rate the feedback responses based on how well they match the context (min: 1, max: 5).</b></p>

  <p>Here, you might want to consider the overall impression you get from each feedback response, including both the content and the tone. Is it appropriate? Expected? Is it how a regular person would react? Does it align with the context provided? In the example shown, the context is about residents in a nursing home passing away due to various symptoms. Feedback responses that acknowledge the gravity of the situation or express sympathy would likely rate higher in matching the context, while responses that seem indifferent or unrelated would rate lower. Expressing happiness, enthusiasm or casual agreement might not align well with the serious nature of the context. Note that in this part of the task, you shouldn't give relatively scoring, that is, your judgment should <b>not</b> be based on how the different feedback responses compare to each other.</p>

  <p><b>Feedback 1:</b> exactly <br> <p>The style is relatively neutral and acknowledges the context. It might not seem fitting given the short clip provided, but imagine what the entire conversation might be about. Is the context part of a bigger narrative? Could it be an answer to a question that the feedback speaker had asked before? Maybe they were talking about examples of cases where someone had died due to a virus, and the feedback speaker <b>agrees</b> with the context speaker that this is a good example of such a case. For instance:</p>

  <p><i>Feedback speaker:</i> "I think Covid symptoms can manifest in many ways and some of them are just impossible to notice." <br>
  <i>Context speaker:</i> "I agree... I work in elderly care and the virus infected quite a few but no one noticed as the symptoms differ, so it went through our nursing home and actually ten of our residents died." <br>
  <i>Feedback speaker:</i> "Exactly."</p>
  
  <p>You can try to imagine different scenarios and think of the frequency of cases where this type of "exactly" is an appropriate reaction, and the frequency of the cases where it is not. We think that it deserves a <b>3</b> but of course you might disagree with it, which is completely fine (that's why we are collecting the data after all).</p>

  <p><b>Feedback 2:</b> yeah <br> <p>Although "yeah" is very often synonymous with "exactly", the way this "yeah" is being said (short and relatively monotonous) can express nonchalance and insensitivity. It might not be the case though; it might be that the feedback speaker speaks this way all the time due to their personality, or you personally might interpret it as a more neutral reaction. In any case, we would like to give it a <b>2</b> as it sounds mostly out of place.</p>

  <p><b>Feedback 3:</b> no <br> <p>"No" can be an appropriate reaction to something negative as it can express empathy, understanding, disbelief and disagreement (with the negative thing in question, not the context speaker itself), but the actual meaning depends on the intonation and the intensity with which it is spoken. Here, the feedback speaker seems to speak fairly intensely, acknowledging the seriousness of what the context speaker said. Therefore, we would like to give it a <b>5</b>.</p>

  <p><b>Feedback 4:</b> ugh <br> <p>Disgust is a completely wrong reaction in this context, for obvious reasons. We give it a <b>1</b>.</p>

  <p><b>Feedback 5:</b> right <br> "Right" is synonymous with "exactly" and "yeah" in many cases, but this specific instance seems to be more empathetic and acknowledgning than Feedback 1 and 2. We will therefore give it a <b>4</b>.</p>

  <p><b>Feedback 6:</b> no <br> Here, the feedback speaker seems to say "no" in a very low-energy, almost bored way. It seems quite out of place in this context, so we would give it a <b>2</b>. Note that it sounds completely different from Feedback 3, even though they are the same word.</p>

  <p><b>Feedback 7:</b> wow <br> "Wow" can be an appropriate reaction to something negative as it can express empathy, understanding, and disbelief. Here, the feedback speaker seems to speak fairly intensely, but there is a hint of positive energy, which is inappropriate. It can still be fitting in some conversations, or you might not perceive it as positive and reassuring, but rather as genuinely stupefied or dumbfounded. We give it a <b>3</b> as it is slightly ambiguous.</p>
  </div>
`,
};



const example_clips_2 = {
  type: 'survey-html-form',
  preamble: '<h2> Example Clips </h2>',
  html: `<style>
    p { text-align: justify; }
    table, th, td {
      border: 1px solid black;
      border-collapse: collapse;
      padding: 10px;
    }
    </style>
  <p> Here, we show one context file and seven feedback files. Note that these samples are not from the actual dataset and the feedback responses are exaggerated. Still, they should give you some idea of what to expect.</p>
  <hr>
  <div style="text-align: left;">
    <p><b>Context Clip:</b></p>
        <audio controls id="context_audio" onloadeddata="this.volume=1.0">
          <source src="https://cdn.jsdelivr.net/gh/qianlivia/perception_study@master/selected_context/1051ef33-9361-41e2-89d9-46d4eb851508_B_2649090_2650110.wav" type="audio/mpeg">
          Your browser does not support the audio element.
        </audio>
    <p><b>Transcript:</b> as the symptoms differ so it went through our nursing home and actually ten of our residents died</p>
  </div>
  <hr>
  <div style="text-align: left;">
    <table style="border-collapse: collapse; text-align: center;">
      <tr>
        <th>Feedback 1:</th>
        <th>Feedback 2:</th>
        <th>Feedback 3:</th>
        <th>Feedback 4:</th>
        <th>Feedback 5:</th>
        <th>Feedback 6:</th>
        <th>Feedback 7:</th>
      </tr>

      <tr>
        <td>
          <audio controls style="width: 100px;" onloadeddata="this.volume=1.0">
            <source src="https://cdn.jsdelivr.net/gh/qianlivia/perception_study@master/selected_feedback_clipped_rms-30_unique/sun_041_exactly.wav" type="audio/mpeg">
          </audio>
        </td>

        <td>
          <audio controls style="width: 100px;" onloadeddata="this.volume=1.0">
            <source src="https://cdn.jsdelivr.net/gh/qianlivia/perception_study@master/selected_feedback_clipped_rms-30_unique/sun_045_yeah.wav" type="audio/mpeg">
          </audio>
        </td>

        <td>
          <audio controls style="width: 100px;" onloadeddata="this.volume=1.0">
            <source src="https://cdn.jsdelivr.net/gh/qianlivia/perception_study@master/selected_feedback_clipped_rms-30_unique/NR_084_no.wav" type="audio/mpeg">
          </audio>
        </td>

        <td>
          <audio controls style="width: 100px;" onloadeddata="this.volume=1.0">
            <source src="https://cdn.jsdelivr.net/gh/qianlivia/perception_study@master/selected_feedback_clipped_rms-30_unique/NegS_020_ugh.wav" type="audio/mpeg">
          </audio>
        </td>

        <td>
          <audio controls style="width: 100px;" onloadeddata="this.volume=1.0">
            <source src="https://cdn.jsdelivr.net/gh/qianlivia/perception_study@master/selected_feedback_clipped_rms-30_unique/sun1_033_right.wav" type="audio/mpeg">
          </audio>
        </td>

        <td>
        <audio controls style="width: 100px;" onloadeddata="this.volume=1.0">
                <source src="https://cdn.jsdelivr.net/gh/qianlivia/perception_study@master/selected_feedback_clipped_rms-30_unique/NR_004_no.wav" type="audio/mpeg">
        </audio> 
        </td>
        
        <td>
        <audio controls style="width: 100px;" onloadeddata="this.volume=1.0">
                <source src="https://cdn.jsdelivr.net/gh/qianlivia/perception_study@master/selected_feedback_clipped_rms-30_unique/PS_107_wow.wav" type="audio/mpeg">
        </audio>
        </td>
      </tr>

      <tr>
        <td>exactly</td>
        <td>yeah</td>
        <td>no</td>
        <td>ugh</td>
        <td>right</td>
        <td>no</td>
        <td>wow</td>
      </tr>
    </table>

  </div>
  <hr>
  <hr>

  <div style="text-align: left;">
  <p><b>Question 2: Choose the two responses that are the most similar to each other.</b></p>
  <p>We understand that this might be a hard question. Thankfully, you will have three instead of seven options to choose from. Here, think about which two feedback responses would be interchangeable, with the least possibility of changing the meaning or the message. For example, if you swapped Feedback 1 and Feedback 5 in the example conversation above, would it still make sense? How about swapping Feedback 2 with Feedback 4? You will most likely choose two responses that were assigned similar scores in the previous question. Note: They don't have to be the ones with the highest score!</p>
  <p>We think the potential candidates are either Feedback 1 (exactly) and 5 (right), or Feedback 1 (exactly) and 2 (yeah). We feel <b>Feedback 1 and 5</b> convey more empathy than Feedback 2, so we would choose these two.</p>
  </div>
`,
};


const example_clips_3 = {
  type: 'survey-html-form',
  preamble: '<h2> Example Clips </h2>',
  html: `<style>
    p { text-align: justify; }
    table, th, td {
      border: 1px solid black;
      border-collapse: collapse;
      padding: 10px;
    }
    </style>
  <p> Here, we show one context file and seven feedback files. Note that these samples are not from the actual dataset and the feedback responses are exaggerated. Still, they should give you some idea of what to expect.</p>
  <hr>
  <div style="text-align: left;">
    <p><b>Context Clip:</b></p>
        <audio controls id="context_audio" onloadeddata="this.volume=1.0">
          <source src="https://cdn.jsdelivr.net/gh/qianlivia/perception_study@master/selected_context/1051ef33-9361-41e2-89d9-46d4eb851508_B_2649090_2650110.wav" type="audio/mpeg">
          Your browser does not support the audio element.
        </audio>
    <p><b>Transcript:</b> as the symptoms differ so it went through our nursing home and actually ten of our residents died</p>
  </div>
  <hr>
  <div style="text-align: left;">
    <table style="border-collapse: collapse; text-align: center;">
      <tr>
        <th>Feedback 1:</th>
        <th>Feedback 2:</th>
        <th>Feedback 3:</th>
        <th>Feedback 4:</th>
        <th>Feedback 5:</th>
        <th>Feedback 6:</th>
        <th>Feedback 7:</th>
      </tr>

      <tr>
        <td>
          <audio controls style="width: 100px;" onloadeddata="this.volume=1.0">
            <source src="https://cdn.jsdelivr.net/gh/qianlivia/perception_study@master/selected_feedback_clipped_rms-30_unique/sun_041_exactly.wav" type="audio/mpeg">
          </audio>
        </td>

        <td>
          <audio controls style="width: 100px;" onloadeddata="this.volume=1.0">
            <source src="https://cdn.jsdelivr.net/gh/qianlivia/perception_study@master/selected_feedback_clipped_rms-30_unique/sun_045_yeah.wav" type="audio/mpeg">
          </audio>
        </td>

        <td>
          <audio controls style="width: 100px;" onloadeddata="this.volume=1.0">
            <source src="https://cdn.jsdelivr.net/gh/qianlivia/perception_study@master/selected_feedback_clipped_rms-30_unique/NR_084_no.wav" type="audio/mpeg">
          </audio>
        </td>

        <td>
          <audio controls style="width: 100px;" onloadeddata="this.volume=1.0">
            <source src="https://cdn.jsdelivr.net/gh/qianlivia/perception_study@master/selected_feedback_clipped_rms-30_unique/NegS_020_ugh.wav" type="audio/mpeg">
          </audio>
        </td>

        <td>
          <audio controls style="width: 100px;" onloadeddata="this.volume=1.0">
            <source src="https://cdn.jsdelivr.net/gh/qianlivia/perception_study@master/selected_feedback_clipped_rms-30_unique/sun1_033_right.wav" type="audio/mpeg">
          </audio>
        </td>

        <td>
        <audio controls style="width: 100px;" onloadeddata="this.volume=1.0">
                <source src="https://cdn.jsdelivr.net/gh/qianlivia/perception_study@master/selected_feedback_clipped_rms-30_unique/NR_004_no.wav" type="audio/mpeg">
        </audio> 
        </td>
        
        <td>
        <audio controls style="width: 100px;" onloadeddata="this.volume=1.0">
                <source src="https://cdn.jsdelivr.net/gh/qianlivia/perception_study@master/selected_feedback_clipped_rms-30_unique/PS_107_wow.wav" type="audio/mpeg">
        </audio>
        </td>
      </tr>

      <tr>
        <td>exactly</td>
        <td>yeah</td>
        <td>no</td>
        <td>ugh</td>
        <td>right</td>
        <td>no</td>
        <td>wow</td>
      </tr>
    </table>

  </div>
  <hr>
  <hr>

  <div style="text-align: left;">
  <p><b>Question 3: Rate the energy level: how energetic is the response (min: 1, max: 5)?</b></p>
  <p>Here, think about how extreme the emotions are, how loudly the feedback speaker speaks, how much effort is put into the response, and how energetic, enthusiastic, upset, irritated, etc. the speaker sounds. A very energetic speaker might speak loudly, with a lot of intonation and variation in pitch, and with a fast pace. A low-energy speaker might speak softly, in a monotone voice, and with a slow pace. The length of the response might vary. Note that energy level is usually independent of the content of what is being said. For example, someone can say "ugh" in a very energetic way (e.g., loudly and with a lot of intonation) or in a very low-energy way (e.g., softly and in a monotone voice). We would rate the energy levels as follows:</p>
  <p><b>Feedback 1:</b> exactly <br> We would give it a <b>3</b>. It is neither very energetic nor very low-energy.</p>
  <p><b>Feedback 2:</b> yeah <br> We would give it a <b>2</b>. It seems quite low-energy and uninterested, but still enunciated.</p>
  <p><b>Feedback 3:</b> no <br> We would give it a <b>4</b>. It seems fairly energetic.</p>
  <p><b>Feedback 4:</b> ugh <br> We would give it a <b>4</b>. It seems fairly energetic. It expresses the disgust very clearly.</p>
  <p><b>Feedback 5:</b> right <br> We would give it a <b>3</b>. It is neither very energetic nor very low-energy.</p>
  <p><b>Feedback 6:</b> no <br> We would give it a <b>1</b>. It seems very low-energy, almost bored.</p>
  <p><b>Feedback 7:</b> wow <br> We would give it a <b>5</b>. It seems very energetic and enthusiastic.</p>
  <p><b>Make sure to consider the feedback responses in the context of the conversation when rating the energy level.</b></p>
  </div>
`,
};


const example_clips_4 = {
  type: 'survey-html-form',
  preamble: '<h2> Example Clips </h2>',
  html: `<style>
    p { text-align: justify; }
    table, th, td {
      border: 1px solid black;
      border-collapse: collapse;
      padding: 10px;
    }
    </style>
  <p> Here, we show one context file and seven feedback files. Note that these samples are not from the actual dataset and the feedback responses are exaggerated. Still, they should give you some idea of what to expect.</p>
  <hr>
  <div style="text-align: left;">
    <p><b>Context Clip:</b></p>
        <audio controls id="context_audio" onloadeddata="this.volume=1.0">
          <source src="https://cdn.jsdelivr.net/gh/qianlivia/perception_study@master/selected_context/1051ef33-9361-41e2-89d9-46d4eb851508_B_2649090_2650110.wav" type="audio/mpeg">
          Your browser does not support the audio element.
        </audio>
    <p><b>Transcript:</b> as the symptoms differ so it went through our nursing home and actually ten of our residents died</p>
  </div>
  <hr>
  <div style="text-align: left;">
    <table style="border-collapse: collapse; text-align: center;">
      <tr>
        <th>Feedback 1:</th>
        <th>Feedback 2:</th>
        <th>Feedback 3:</th>
        <th>Feedback 4:</th>
        <th>Feedback 5:</th>
        <th>Feedback 6:</th>
        <th>Feedback 7:</th>
      </tr>

      <tr>
        <td>
          <audio controls style="width: 100px;" onloadeddata="this.volume=1.0">
            <source src="https://cdn.jsdelivr.net/gh/qianlivia/perception_study@master/selected_feedback_clipped_rms-30_unique/sun_041_exactly.wav" type="audio/mpeg">
          </audio>
        </td>

        <td>
          <audio controls style="width: 100px;" onloadeddata="this.volume=1.0">
            <source src="https://cdn.jsdelivr.net/gh/qianlivia/perception_study@master/selected_feedback_clipped_rms-30_unique/sun_045_yeah.wav" type="audio/mpeg">
          </audio>
        </td>

        <td>
          <audio controls style="width: 100px;" onloadeddata="this.volume=1.0">
            <source src="https://cdn.jsdelivr.net/gh/qianlivia/perception_study@master/selected_feedback_clipped_rms-30_unique/NR_084_no.wav" type="audio/mpeg">
          </audio>
        </td>

        <td>
          <audio controls style="width: 100px;" onloadeddata="this.volume=1.0">
            <source src="https://cdn.jsdelivr.net/gh/qianlivia/perception_study@master/selected_feedback_clipped_rms-30_unique/NegS_020_ugh.wav" type="audio/mpeg">
          </audio>
        </td>

        <td>
          <audio controls style="width: 100px;" onloadeddata="this.volume=1.0">
            <source src="https://cdn.jsdelivr.net/gh/qianlivia/perception_study@master/selected_feedback_clipped_rms-30_unique/sun1_033_right.wav" type="audio/mpeg">
          </audio>
        </td>

        <td>
        <audio controls style="width: 100px;" onloadeddata="this.volume=1.0">
                <source src="https://cdn.jsdelivr.net/gh/qianlivia/perception_study@master/selected_feedback_clipped_rms-30_unique/NR_004_no.wav" type="audio/mpeg">
        </audio> 
        </td>
        
        <td>
        <audio controls style="width: 100px;" onloadeddata="this.volume=1.0">
                <source src="https://cdn.jsdelivr.net/gh/qianlivia/perception_study@master/selected_feedback_clipped_rms-30_unique/PS_107_wow.wav" type="audio/mpeg">
        </audio>
        </td>
      </tr>

      <tr>
        <td>exactly</td>
        <td>yeah</td>
        <td>no</td>
        <td>ugh</td>
        <td>right</td>
        <td>no</td>
        <td>wow</td>
      </tr>
    </table>

  </div>
  <hr>
  <hr>

  <div style="text-align: left;">
  <p><b>Question 4: Rate polarity: how positive is the response (min: 1, max: 5)?</b></p>
  <p>Polarity refers to whether the feedback response is positive, negative, or neutral in sentiment. A positive response expresses agreement, happiness, or approval; a negative response conveys disagreement, sadness, or disapproval; and a neutral response is neither positive nor negative. For example, "exactly" and "right" are generally positive responses as they indicate agreement. "No" can be seen as negative, especially in this context where it likely expresses empathy or disbelief regarding the negative situation described. "Ugh" is clearly negative as it expresses disgust. "Yeah" is more neutral but leans slightly positive as it indicates acknowledgment without strong emotion. We would rate the polarity as follows:</p>
  <p><b>Feedback 1:</b> exactly <br> We would give it a <b>4</b>. It indicates agreement, which is generally positive.</p>
  <p><b>Feedback 2:</b> yeah <br> We would give it a <b>3</b>. It is more neutral but leans slightly positive.</p>
  <p><b>Feedback 3:</b> no <br> We would give it a <b>2</b>. It is likely expressing empathy or disbelief regarding the negative situation.</p>
  <p><b>Feedback 4:</b> ugh <br> We would give it a <b>1</b>. It clearly expresses disgust, which is negative.</p>
  <p><b>Feedback 5:</b> right <br> We would give it a <b>4</b>. Similar to "exactly," it indicates agreement.</p>
  <p><b>Feedback 6:</b> no <br> We would give it a <b>2</b>. It is likely expressing empathy or disbelief regarding the negative situation, though in a low-energy way.</p>
  <p><b>Feedback 7:</b> wow <br> We would give it a <b>5</b>, as we feel it sounds very positively surprised. It can also be seen as neutral, expressing astonishment without a clear positive or negative sentiment (in which case it would be a <b>3</b>). It's up to you to decide!</p>
  <p><b>Make sure to consider the feedback responses in the context of the conversation when rating polarity.</b></p>
  </div>`,
};


const example_clips_5 = {
  type: 'survey-html-form',
  preamble: '<h2> Example Clips </h2>',
  html: `<style>
    p { text-align: justify; }
    table, th, td {
      border: 1px solid black;
      border-collapse: collapse;
      padding: 10px;
    }
    </style>
  <p> Here, we show one context file and seven feedback files. Note that these samples are not from the actual dataset and the feedback responses are exaggerated. Still, they should give you some idea of what to expect.</p>
  <hr>
  <div style="text-align: left;">
    <p><b>Context Clip:</b></p>
        <audio controls id="context_audio" onloadeddata="this.volume=1.0">
          <source src="https://cdn.jsdelivr.net/gh/qianlivia/perception_study@master/selected_context/1051ef33-9361-41e2-89d9-46d4eb851508_B_2649090_2650110.wav" type="audio/mpeg">
          Your browser does not support the audio element.
        </audio>
    <p><b>Transcript:</b> as the symptoms differ so it went through our nursing home and actually ten of our residents died</p>
  </div>
  <hr>
  <div style="text-align: left;">
    <table style="border-collapse: collapse; text-align: center;">
      <tr>
        <th>Feedback 1:</th>
        <th>Feedback 2:</th>
        <th>Feedback 3:</th>
        <th>Feedback 4:</th>
        <th>Feedback 5:</th>
        <th>Feedback 6:</th>
        <th>Feedback 7:</th>
      </tr>

      <tr>
        <td>
          <audio controls style="width: 100px;" onloadeddata="this.volume=1.0">
            <source src="https://cdn.jsdelivr.net/gh/qianlivia/perception_study@master/selected_feedback_clipped_rms-30_unique/sun_041_exactly.wav" type="audio/mpeg">
          </audio>
        </td>

        <td>
          <audio controls style="width: 100px;" onloadeddata="this.volume=1.0">
            <source src="https://cdn.jsdelivr.net/gh/qianlivia/perception_study@master/selected_feedback_clipped_rms-30_unique/sun_045_yeah.wav" type="audio/mpeg">
          </audio>
        </td>

        <td>
          <audio controls style="width: 100px;" onloadeddata="this.volume=1.0">
            <source src="https://cdn.jsdelivr.net/gh/qianlivia/perception_study@master/selected_feedback_clipped_rms-30_unique/NR_084_no.wav" type="audio/mpeg">
          </audio>
        </td>

        <td>
          <audio controls style="width: 100px;" onloadeddata="this.volume=1.0">
            <source src="https://cdn.jsdelivr.net/gh/qianlivia/perception_study@master/selected_feedback_clipped_rms-30_unique/NegS_020_ugh.wav" type="audio/mpeg">
          </audio>
        </td>

        <td>
          <audio controls style="width: 100px;" onloadeddata="this.volume=1.0">
            <source src="https://cdn.jsdelivr.net/gh/qianlivia/perception_study@master/selected_feedback_clipped_rms-30_unique/sun1_033_right.wav" type="audio/mpeg">
          </audio>
        </td>

        <td>
        <audio controls style="width: 100px;" onloadeddata="this.volume=1.0">
                <source src="https://cdn.jsdelivr.net/gh/qianlivia/perception_study@master/selected_feedback_clipped_rms-30_unique/NR_004_no.wav" type="audio/mpeg">
        </audio> 
        </td>
        
        <td>
        <audio controls style="width: 100px;" onloadeddata="this.volume=1.0">
                <source src="https://cdn.jsdelivr.net/gh/qianlivia/perception_study@master/selected_feedback_clipped_rms-30_unique/PS_107_wow.wav" type="audio/mpeg">
        </audio>
        </td>
      </tr>

      <tr>
        <td>exactly</td>
        <td>yeah</td>
        <td>no</td>
        <td>ugh</td>
        <td>right</td>
        <td>no</td>
        <td>wow</td>
      </tr>
    </table>

  </div>
  <hr>
  <hr>

  <div style="text-align: left;">
  <p><b>Question 5: Rate surprisal: how surprised does the feedback speaker sound (min: 1, max: 5)?</b></p>
  <p>Surprisal refers to the degree of surprise or astonishment expressed in the feedback response. A high surprisal rating indicates that the speaker sounds very surprised, while a low rating suggests that the speaker is not surprised at all, or worse, bored. In this context, Feedback 3 ("no") and Feedback 7 ("wow") likely express a high level of surprise or disbelief regarding the negative situation described, so we would rate them high on surprisal. "Ugh" might also indicate some level of surprise, but it is more about disgust than astonishment. "Exactly," "yeah," and "right" are more neutral and do not convey much surprise. Feedback 6 ("no") seems to express a low level of surprise or disbelief, sounding more bored or uninterested. We would rate the surprisal as follows:</p>
  <p><b>Feedback 1:</b> exactly <br> We would give it a <b>2</b>. It does not convey much surprise.</p>
  <p><b>Feedback 2:</b> yeah <br> We would give it a <b>2</b>. It does not convey much surprise.</p>
  <p><b>Feedback 3:</b> no <br> We would give it a <b>4</b>. It likely expresses a high level of surprise or disbelief.</p>
  <p><b>Feedback 4:</b> ugh <br> We would give it a <b>3</b>. It might indicate some level of surprise, but it is more about disgust.</p>
  <p><b>Feedback 5:</b> right <br> We would give it a <b>3</b>. The intonation indicates a moderate level of surprise and acknowledgement.</p>
  <p><b>Feedback 6:</b> no <br> We would give it a <b>1</b>. It likely expresses a low level of surprise or disbelief, sounding more bored or uninterested.</p>
  <p><b>Feedback 7:</b> wow <br> We would give it a <b>5</b>. It likely expresses a very high level of surprise or astonishment.</p>
  <p><b>Make sure to consider the feedback responses in the context of the conversation when rating surprisal.</b></p>
  </div>
`,
};

const example_clips_6 = {
  type: 'survey-html-form',
  preamble: '<h2> Example Clips </h2>',
  html: `<style>
    p { text-align: justify; }
    table, th, td {
      border: 1px solid black;
      border-collapse: collapse;
      padding: 10px;
    }
    </style>
  <p> Here, we show one context file and seven feedback files. Note that these samples are not from the actual dataset and the feedback responses are exaggerated. Still, they should give you some idea of what to expect.</p>
  <hr>
  <div style="text-align: left;">
    <p><b>Context Clip:</b></p>
        <audio controls id="context_audio" onloadeddata="this.volume=1.0">
          <source src="https://cdn.jsdelivr.net/gh/qianlivia/perception_study@master/selected_context/1051ef33-9361-41e2-89d9-46d4eb851508_B_2649090_2650110.wav" type="audio/mpeg">
          Your browser does not support the audio element.
        </audio>
    <p><b>Transcript:</b> as the symptoms differ so it went through our nursing home and actually ten of our residents died</p>
  </div>
  <hr>
  <div style="text-align: left;">
    <table style="border-collapse: collapse; text-align: center;">
      <tr>
        <th>Feedback 1:</th>
        <th>Feedback 2:</th>
        <th>Feedback 3:</th>
        <th>Feedback 4:</th>
        <th>Feedback 5:</th>
        <th>Feedback 6:</th>
        <th>Feedback 7:</th>
      </tr>

      <tr>
        <td>
          <audio controls style="width: 100px;" onloadeddata="this.volume=1.0">
            <source src="https://cdn.jsdelivr.net/gh/qianlivia/perception_study@master/selected_feedback_clipped_rms-30_unique/sun_041_exactly.wav" type="audio/mpeg">
          </audio>
        </td>

        <td>
          <audio controls style="width: 100px;" onloadeddata="this.volume=1.0">
            <source src="https://cdn.jsdelivr.net/gh/qianlivia/perception_study@master/selected_feedback_clipped_rms-30_unique/sun_045_yeah.wav" type="audio/mpeg">
          </audio>
        </td>

        <td>
          <audio controls style="width: 100px;" onloadeddata="this.volume=1.0">
            <source src="https://cdn.jsdelivr.net/gh/qianlivia/perception_study@master/selected_feedback_clipped_rms-30_unique/NR_084_no.wav" type="audio/mpeg">
          </audio>
        </td>

        <td>
          <audio controls style="width: 100px;" onloadeddata="this.volume=1.0">
            <source src="https://cdn.jsdelivr.net/gh/qianlivia/perception_study@master/selected_feedback_clipped_rms-30_unique/NegS_020_ugh.wav" type="audio/mpeg">
          </audio>
        </td>

        <td>
          <audio controls style="width: 100px;" onloadeddata="this.volume=1.0">
            <source src="https://cdn.jsdelivr.net/gh/qianlivia/perception_study@master/selected_feedback_clipped_rms-30_unique/sun1_033_right.wav" type="audio/mpeg">
          </audio>
        </td>

        <td>
        <audio controls style="width: 100px;" onloadeddata="this.volume=1.0">
                <source src="https://cdn.jsdelivr.net/gh/qianlivia/perception_study@master/selected_feedback_clipped_rms-30_unique/NR_004_no.wav" type="audio/mpeg">
        </audio> 
        </td>
        
        <td>
        <audio controls style="width: 100px;" onloadeddata="this.volume=1.0">
                <source src="https://cdn.jsdelivr.net/gh/qianlivia/perception_study@master/selected_feedback_clipped_rms-30_unique/PS_107_wow.wav" type="audio/mpeg">
        </audio>
        </td>
      </tr>

      <tr>
        <td>exactly</td>
        <td>yeah</td>
        <td>no</td>
        <td>ugh</td>
        <td>right</td>
        <td>no</td>
        <td>wow</td>
      </tr>
    </table>

  </div>
  <hr>
  <hr>

  <h2>Summary</h2>
  <table style="border-collapse: collapse; text-align: center;">
    <tr>
      <th>Feedback</th>
      <th>Audio</th>
      <th>Context matching (Q1)</th>
      <th>Energy (Q3)</th>
      <th>Polarity (Q4)</th>
      <th>Surprisal (Q5)</th>
    </tr>
    <tr>
      <td>1: exactly</td>
      <td>
        <audio controls style="width: 100px;" onloadeddata="this.volume=1.0">
          <source src="https://cdn.jsdelivr.net/gh/qianlivia/perception_study@master/selected_feedback_clipped_rms-30_unique/sun_041_exactly.wav" type="audio/mpeg">
        </audio>
      </td>
      <td>3</td>
      <td>3</td>
      <td>4</td>
      <td>2</td>
    </tr>
    <tr>
      <td>2: yeah</td>
      <td>
        <audio controls style="width: 100px;" onloadeddata="this.volume=1.0">
          <source src="https://cdn.jsdelivr.net/gh/qianlivia/perception_study@master/selected_feedback_clipped_rms-30_unique/sun_045_yeah.wav" type="audio/mpeg">
        </audio>
      </td>
      <td>2</td>
      <td>2</td>
      <td>3</td>
      <td>2</td>
    </tr>
    <tr>
      <td>3: no</td>
      <td>
        <audio controls style="width: 100px;" onloadeddata="this.volume=1.0">
          <source src="https://cdn.jsdelivr.net/gh/qianlivia/perception_study@master/selected_feedback_clipped_rms-30_unique/NR_084_no.wav" type="audio/mpeg">
        </audio>
      </td>
      <td>5</td>
      <td>4</td>
      <td>2</td>
      <td>4</td>
    </tr>
    <tr>
      <td>4: ugh</td>
      <td>
        <audio controls style="width: 100px;" onloadeddata="this.volume=1.0">
          <source src="https://cdn.jsdelivr.net/gh/qianlivia/perception_study@master/selected_feedback_clipped_rms-30_unique/NegS_020_ugh.wav" type="audio/mpeg">
        </audio>
      </td>
      <td>1</td>
      <td>4</td>
      <td>1</td>
      <td>3</td>
    </tr>
    <tr>
      <td>5: right</td>
      <td>
        <audio controls style="width: 100px;" onloadeddata="this.volume=1.0">
          <source src="https://cdn.jsdelivr.net/gh/qianlivia/perception_study@master/selected_feedback_clipped_rms-30_unique/sun1_033_right.wav" type="audio/mpeg">
        </audio>
      </td>
      <td>4</td>
      <td>3</td>
      <td>4</td>
      <td>3</td>
    </tr>
    <tr>
      <td>6: no</td>
      <td>
        <audio controls style="width: 100px;" onloadeddata="this.volume=1.0">
          <source src="https://cdn.jsdelivr.net/gh/qianlivia/perception_study@master/selected_feedback_clipped_rms-30_unique/NR_004_no.wav" type="audio/mpeg">
        </audio>
      </td>
      <td>2</td>
      <td>1</td>
      <td>2</td>
      <td>1</td>
    </tr>
    <tr>
      <td>7: wow</td>
      <td>
        <audio controls style="width: 100px;" onloadeddata="this.volume=1.0">
          <source src="https://cdn.jsdelivr.net/gh/qianlivia/perception_study@master/selected_feedback_clipped_rms-30_unique/PS_107_wow.wav" type="audio/mpeg">
        </audio>
      </td>
      <td>3</td>
      <td>5</td>
      <td>5</td>
      <td>5</td>
    </tr>
  </table>

  <p> You can also see that Feedback 1 (exactly) and Feedback 5 (right) have very similar scores across all dimensions, which reflects why we would choose them as <b>the most similar pair (Q2)</b>. </p>

  <p> If you think you understand the task, please proceed to the actual test by pressing the "Continue" button below. </p>`,
};

let timeline_all = [inital_confirm_headphones, example_clips_1, example_clips_2, example_clips_3, example_clips_4, example_clips_5, example_clips_6];
timeline_all = timeline_all.concat(jsPsych.randomization.shuffle(timeline));
timeline_all = timeline_all.concat([confirm_headphones, feedback_for_test, end_test]);


jsPsych.init({
  timeline: timeline_all,
  show_progress_bar: true,
  on_finish() {
    window.location.href = "https://app.prolific.com/submissions/complete?cc=CJN86A8G"
  }
});
})();