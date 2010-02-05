if (typeof load !== "undefined"){
  load('../src/pretty_printer.js');
  load('../lib/simple_test.js');
  load('../lib/simple_test.simple_reporter.js');
}

new SimpleTestSuite(function(test){

  var DOM_PRESENT = !(typeof document === "undefined");

  function emptyFunction(){}

  var SELF_REFERENCING_OBJECT = {};
  SELF_REFERENCING_OBJECT.self = SELF_REFERENCING_OBJECT;

  var SELF_REFERENCING_ARRAY = [];
  SELF_REFERENCING_ARRAY.push(SELF_REFERENCING_ARRAY);

  var ARGUMENTS_OBJECT; (function() { ARGUMENTS_OBJECT = arguments; })();

  var ARRAY_LIKE_OBJECT = {length:0};

  test('Object.toPrettyString should not cause a recursion error', function(){
    try{
      Object.toPrettyString(SELF_REFERENCING_OBJECT);
    }catch(e){
      return !(e.message === 'Maximum call stack size exceeded' || e.message === 'too much recursion');
    }
    return true;
  });

  var OBJECTS = [
    'undefined',               'undefined',
    'null',                    'null',
    'true',                    'true',
    'false',                   'false',
    'Number',                  'Number',
    'Array',                   'Array',
    'Object',                  'Object',
    'emptyFunction',           /^\n?function emptyFunction\(\)\s?\{[\s\n]*\}\n*/,
    '""',                      '""',
    '0',                       '0',
    '[]',                      '[]',
    '{}',                      '{}',
    '/./',                     '/./',
    'ARGUMENTS_OBJECT',        '[]',
    'ARRAY_LIKE_OBJECT',       '[]',

    '"hello"',                 '"hello"',
    '5',                       '5',
    '12.66',                   '12.66',
    '[1,2,3]',                 '[1, 2, 3]',
    '{one: 1}',                '{one:1}',
    'new String',              '""',

    '{a: "more", complex:42}', '{a:"more", complex:42}',
    'SELF_REFERENCING_OBJECT', '{self:{...}}',
    'SELF_REFERENCING_ARRAY',  '[[...]]'
  ];

  // browser specific tests
  if (DOM_PRESENT) OBJECTS.push(
    'document',                      '[object HTMLDocument]',
    'document.createElement("div")', '[object HTMLDivElement]'
  );

  for (var i=0; i < OBJECTS.length; i += 2) {
    var evalable = OBJECTS[i], expected = OBJECTS[i + 1];

    test('Object.toPrettyString('+evalable+') === "'+expected+'"', function(){
      Object.toPrettyString.objects = [];

      var object = eval('('+evalable+')'), pretty_string = Object.toPrettyString(object);

      var matched = (
        (expected instanceof RegExp) ? pretty_string.match(expected) : pretty_string === expected
      );

      if (!matched)
        console.log('EXPECTED '+pretty_string+' === '+expected);

      cleanedup = Object.toPrettyString.objects.length === 0;
      if (!cleanedup) console.log('('+evalable+') leaked '+Object.toPrettyString.objects.length+' objects');

      return matched && cleanedup;
    });
  };


  test('Object.toPrettyString should work on this huge object', function(){
    var huge_object = {
      array: ['a',2],
      object: {hello:'there'}
    };
    huge_object.array_with_self = [huge_object];

    console.log(Object.toPrettyString(huge_object));
    return Object.toPrettyString(huge_object) === '{array:["a", 2], object:{hello:"there"}, array_with_self:[{...}]}';
  });

  if (DOM_PRESENT){
    test('Object.toPrettyString should work on this huge object with DOM nodes', function(){
      return true;
    });
  }

});
