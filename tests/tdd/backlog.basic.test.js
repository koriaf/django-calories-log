var url = 'http://localhost:7329/';

module.exports = {
'Got right website': function (test) {
  test
    .open(url)
    .assert.title().is('Nutrition logger', 'Got right website')
    .done();
},
'Can find something': function (test) {
  test
    .open(url)
    .waitForElement("#id_food_search_input")
    .type('#id_food_search_input', 'egg')
    .click('#id_food_search_button')
    .waitFor(
        function(){
            return !!document.querySelector('td[value="Crackers, matzo, egg"');
        },
        [],
        6000
    )
    .done();
}
};