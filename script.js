
document.addEventListener('DOMContentLoaded', () => {
    //Como coloquei o <script> tag na head do html file, é necessário assegurar que o código JavaScript só é lido após o carregamento total do DOM

    //DROPDOWN MENU
    const dropdown = document.querySelector('.dropdown');
    const select = dropdown.querySelector(".select");
    const selected = dropdown.querySelector(".selected");
    const arrow = dropdown.querySelector(".arrow");
    const menu = dropdown.querySelector(".menu");
    const options = dropdown.querySelectorAll(".menu li");

    select.addEventListener('click', () => {
        //o arrow roda para baixo/cima
        arrow.classList.toggle("arrow-rotate");
        //e o menu aparece/desaparece
        menu.classList.toggle("menu-open");
    });

    //FETCHING DATA
    const search = document.querySelector('.search');
    const cardsContainer = document.querySelector('.cards-container');

    const APIEndpoint = 'https://restcountries.com/v3.1/all';

    fetch(APIEndpoint) //--> promise Object
        //em caso de success, executa a resolveCallback
        .then(HTTPresponseObject => HTTPresponseObject.json()) //--> promise
        //.then(resolveCallback_definition)
        //response.json vai buscar o json body content da response
        .then(jsonData => {
            console.log(jsonData);
            //Os dados fetched correspondem a um Array de Objetos, cada um com informação de um país diferente [(...), capital: ['Nouakchott'], {name: {common: 'Mauritania', official: 'Islamic Republic of Mauritania', nativeName: {ara: {{official: '', common: ''}}, population: 4567892, flags: {png: '',svg: ''}, languages : {nld: 'Dutch', pap: 'Papiamento'}...}, currencies: {EUR: {name: 'Euro', symbol: '€'}}, borders: ['DZA', 'MLI', 'SEN', 'ESH'], (...)]

            jsonData.forEach(countryObject => {

                cardsContainer.innerHTML += `
                <div class="card">
                    
                    <img src="${countryObject.flags.svg}" alt="countryFlag">
                
                    <div class="countryInfo">
                        <h3 class="countryName">${countryObject.name.common}</h3>
                        <p><span>Population: </span>${countryObject.population}</p>
                        <p><span>Region: </span>${countryObject.region}</p>
                        <p><span>Capital: </span>${countryObject.capital !== undefined ? countryObject.capital[0] : "--"}</p>
                    </div>
                </div>
                `
                //PROBLEMA: erro no countryObject de indíce 26 pq não existe o par capital: ['nome da capital']; SOLUÇÃO: adicionar a condição countryObject.capital != undefined ? countryObject.capital[0] : "--" para que, nos casos em que essa property não existe, completar com "--". Assim o fetching de dados não é interrompido
    
            });

            return jsonData; /*para poder voltar a ser usada no .then seguinte, QUANDO E SE O FETCHING DE DADOS TERMINAR COM SUCESSO pq... */
        }) //--> promise
        .then((jsonData) => {
            /*... só faz sentido poder clicar nos cards, pesquisar ou filtrá-los DEPOIS de terem sido adicionados sem falhas */

            //CARDS
            const cards = document.querySelectorAll('.card');
            //console.log(cards);
            Array.from(cards).forEach(card => card.addEventListener('click', () => {
                /*vai buscar o common name do país ao card*/
                const cName = card.children[1].children[0].innerHTML;
                /*e procura o countryObject com o nome correspondente*/
                showCountryDetails(jsonData, cName);
            }));

            /*tinha feito assim (código em comentário), mas eu quero que a pesquisa seja automática... então ter lá um submit button ou ter de clicar no enter para que apareçam resultados não faz muito sentido. Para além disso, estava só a considerar quando o user pesquisa pelo nome completo
            //SUBMIT FORM (Se clicar no 'Enter' ou 'Submit' button)
            const form = document.querySelector('form');
            form.addEventListener('submit', (eventObject) => {
                eventObject.preventDefault();
                cards.forEach(card => {
                    if(card.children[1].children[0].innerHTML.toLowerCase().includes(eventObject.target.value.toLowerCase())){
                        card.style.display = "block";
                    }else{
                        card.style.display = "none";
                    };
                });
            });*/

            //INSTANT SEARCH
            const input = document.querySelector('input');
            //o evento 'input' é gatilhado sempre que o input.value muda
            input.addEventListener('input',  () => {
                cards.forEach(card => {
                    //se o nome que aparece no card (string) incluí (.includes) o input.value pelo qual estou a pesquisar (substring)
                    if(card.children[1].children[0].innerHTML.toLowerCase().includes(input.value.toLowerCase())){
                        card.style.display = "block";
                    }else{
                        card.style.display = "none";
                    };
                });
            });

            //FILTER BY REGION
            options.forEach(option => {
                //quando o user clica numa opção
                option.addEventListener('click', () => {
                    //o innerText do div.selected altera-se para o da option selecionada
                    selected.innerText = option.innerText;
                    //o arrow gira de volta
                    arrow.classList.remove("arrow-rotate");
                    //e o menu fecha/desaparece
                    menu.classList.remove("menu-open");
                    //remove a active class de todas as options
                    options.forEach(option => {
                        option.classList.remove("active");
                    });
                    //e adiciona-a à selecionada
                    option.classList.add("active");
        
                    cards.forEach(card => {
                        const cRegion = card.children[1].children[2].innerText.split(' ')[1]; //Region que escrevi para o card
                        if(cRegion == option.innerText){
                            card.style.display = 'block';
                        }else{
                            card.style.display = 'none';
                        };
                    });
                    
                });
            });

        })
        //em caso de failure, executa a rejectCallback
        .catch(error => console.log(error))
        //.catch(rejectCallback_definition)

    
    //DEFINIR FUNÇÕES (tinha feito dentro do fetch, mas assim faz mais sentido/fica o código mais clean)
    function showCountryDetails(jsonData, cName){
        jsonData.forEach(countryObject => {
            //countryObject.name.common === 'Antarctica' ? console.log(countryObject) : console.log('not found')
            if(countryObject.name.common === cName){

                //Collecting the official native name, na primeira língua em que aparece escrito
                if(countryObject.name.nativeName !== undefined){
                    const keysArr = Object.keys(countryObject.name.nativeName);
                    var nativeName = countryObject.name.nativeName[keysArr[0]].official;
                }else{
                    var nativeName = '--';
                };

                //Collecting the currency data
                if(countryObject.currencies !== undefined){
                    const currKeysArray = Object.keys(countryObject.currencies);
                    const currenciesArr = currKeysArray.map(key => countryObject.currencies[key].name);
                    var currenciesStr = currenciesArr.join(', ');
                }else{
                    var currenciesStr = '--';
                };
                
                /*Há países, nomeadamente, da região da Antarctica, que não têm nem nativeName, nem currencies, nem languages (faz sentido), por isso, tive de considerar esses casos*/
                
                //Collecting the languages data
                if(countryObject.languages !== undefined){
                    const langKeysArr = Object.keys(countryObject.languages);
                    const languagesArr = langKeysArr.map(key => countryObject.languages[key]);
                    var languagesStr = languagesArr.join(', ');
                }else{
                    var languagesStr = '--';
                };
                
                //Collecting the top level domains
                const tldKeysArr = Object.keys(countryObject.tld);
                const tldArr = tldKeysArr.map(key => countryObject.tld[key]);
                const tldStr = tldArr.join(', ');
               
                const theme = document.querySelector('.theme'); //vou buscar o div.theme para inserir os dados do tema pré-selecionado ANTES de "mudar de página"

                //e os div.goBack e div.countryDetails do próximo country são inseridos no body.innerHTML, com a informação detalhada do país do card em que o user clicou

                body.innerHTML = `

                <header>
                    <div class="text">
                        <h2>Where in the world?</h2>
                    </div>

                    <div class="theme">
                        <img src="${theme.children[0].getAttribute('src')}">
                        <p>${theme.children[1].innerText}</p>
                    </div>
                </header>

                <div class="goBack">
                    <div class="backBtn">
                        Back
                    </div>
                </div>
                
                <div class="countryDetails">
                    
                    <img class="flag" src="${countryObject.flags.svg}" alt="countryFlag">
                    
                    <div class="countryDetailsInfo">
                        <h1>${cName}</h1>

                        <div class="info">
                            <div class="info-left">
                                <p><span>Native Name: </span>${nativeName}</p>
                                <p><span>Population: </span>${countryObject.population}</p>
                                <p><span>Region: </span>${countryObject.region}</p>
                                <p><span>Sub Region: </span>${countryObject.subregion !== undefined ? countryObject.subregion : "--"}</p>
                                <p><span>Capital: </span>${countryObject.capital !== undefined ? countryObject.capital[0] : "--"}</p>
                            </div>

                            <div class="info-right">
                                <p><span>Top Level Domain: </span>${tldStr}</p>
                                <p><span>Currencies: </span>${currenciesStr}</p>
                                <p><span>Languages: </span>${languagesStr}</p>
                            </div>
                        </div>

                        <div class="border-countries">
                            <span>Border Countries: </span>
                        </div>
                    </div>
                </div>
                `
                //Adicionar um div.border-country por cada país fronteira do country principal, dentro do div.border-countries e redirecionar para a página do respetivo border-country quando clicado
                
                const borderCountries = document.querySelector('.border-countries');
                if(countryObject.borders){ /*se existe a property borders*/
                    /*para cada countryCode no array de borders*/
                    countryObject.borders.forEach(countryCode => {
                        /*criamos um div.border-country*/
                        const div = document.createElement('div');
                        div.classList.add('border-country');
                        borderCountries.appendChild(div);
                        /*e vamos buscar o nome do border country correspondente a esse countryCode para preencher o innerText do div*/
                        jsonData.forEach(countryObject => {
                            if(countryObject.cca3 === countryCode){
                                div.innerText = countryObject.name.common; 
                            };
                        });
                    });

                }else{ //se não existe
                    borderCountries.innerHTML = `
                        <p><span>Border Countries: </span>No border countries!</p>
                    `
                };

                const goBack = document.querySelector('.goBack');
                const countryDetails = document.querySelector('.countryDetails');
                goBack.addEventListener('click', () => {
                    goBack.style.display = 'none';
                    countryDetails.style.display = 'none';
                    body.appendChild(search); //tenho de adicionar de novo pq alterei o body.innerHTML antes
                    body.appendChild(cardsContainer);
                });
            };
        });

        const allBorderCountries = document.querySelectorAll('.border-country');
        //console.log(allBorderCountries);
        Array.from(allBorderCountries).forEach(borderCountry => borderCountry.addEventListener('click', () => {
            const cName = borderCountry.innerText;
            showCountryDetails(jsonData, cName);
        }));

        body = document.querySelector('body');
        themeIcon = document.querySelector('.theme img');
        mode = document.querySelector('.theme p');

        themeToggle(body, themeIcon, mode);
    };

    //THEME
    let body = document.querySelector('body');
    let themeIcon = document.querySelector('.theme img');
    let mode = document.querySelector('.theme p');

    function themeToggle(body, themeIcon, mode){
        themeIcon.addEventListener('click', () => {    
            body.classList.toggle('light-theme');
            if(body.classList.contains('light-theme')){
                themeIcon.setAttribute('src', 'images/icon-sun.svg');
                mode.innerText = 'Light Mode'; /*quero que o text apresentado seja com o nome do tema atual e não para o qual mudo, se clicar no icon*/
            }else{
                themeIcon.setAttribute('src', 'images/icon-moon.svg');
                mode.innerText = 'Dark Mode';
            };
        });
    };

    themeToggle(body, themeIcon, mode);

    //PROBLEMA: themeToggle só está a funcionar para a página inicial, antes de clicar num card. MOTIVO: penso que isto acontece pq, no processo, o body content muda e a variável body que guardei já não existe. SOLUÇÃO: declarar a variável com let, em vez de const, para que possa ser redefinida sempre que alterar o body.innerHTML. Fazer o mesmo para as variáveis themeIcon e mode e reescrever a função de forma a receber esses 3 argumentos.
        
});

//Achava que ia ter de fazer outro HTML document + CSS + JavaScript, para "mudar de página", mas achava mal... pq, fazendo outro HTML document, eu iria ter de conectá-lo a um JavaScript file *diferente*... pq o DOM ia ser diferente... e não ia conseguir ir buscar a informação do click event que ocorreu no card do html file anterior... ou, se possível, *AINDA* não sei como.







