// Global variables for setting view mode and queryparams
var VIEW_MODE = 'PAGE_VIEW';
var TOTAL_PAGES = 0;
var QUERY_PARAMS = {
  PAGE: 1,
  SEARCH: '',
  SORT: '',
  ORDER: 'asc',
};
var PAGINATION_LIMIT = 12;


//--------------------- add Event Listeners ---------------------------------------------

// to fetch total items and add suitable number of navlink or buttons in the page
window.addEventListener('load', function () {
  ajaxRequest(addNavLinks, 'total');
});

// logo onClick event listener, redirects to page view first page
document.querySelector('#title').addEventListener('click', switchToPageView);

// when view is set to infinite scrolling, to handle pagination
window.addEventListener('scroll', function () {
  if (VIEW_MODE === 'LIST_VIEW' && QUERY_PARAMS.PAGE < TOTAL_PAGES) {
    if (window.pageYOffset + window.innerHeight >= document.body.offsetHeight) {
      QUERY_PARAMS.PAGE += 1;
      loadMovies();
    }
  }
});

// search event listener, when user types and presses enter
document.querySelector('#search').addEventListener('keyup', function (e) {
  // listen for enter key press and then call the api with query params
  if (e.keyCode === 13) {
    QUERY_PARAMS.SEARCH = e.target.value;
    QUERY_PARAMS.PAGE = 1;
    loadMovies();
  }
});

// sort event listeners, including order of sort
document.querySelector('#sort-by-select').addEventListener('change', handleSort);
document.querySelector('#sort-asc').addEventListener('click', handleSortOrder);
document.querySelector('#sort-desc').addEventListener('click', handleSortOrder);

// switch view event listeners
document.querySelector('#page-view').addEventListener('click', switchToPageView);
document.querySelector('#list-view').addEventListener('click', switchToListView);

// -------------------- end of event listeners -------------------------------------------

// ---------------- callback functions for event listeners -------------------------------

// onclick of navlink buttons load corresponding page movies and set class as active for that button
function navButtonClick(e) {
  QUERY_PARAMS.PAGE = Number(e.target.dataset.page);
  loadMovies();
}

function addNavLinks(movies) {
  // calculate the total number of navLinks to be added to the page
  var noOfButtons = Math.ceil(movies.total / PAGINATION_LIMIT);
  TOTAL_PAGES = noOfButtons;

  var navLinks = document.querySelector('.nav_links');

  // add the navlinks to the DOM
  for (i = 0; i < noOfButtons; i++) {
    var btn = document.createElement('button');
    btn.innerHTML = (i + 1);

    btn.addEventListener('click', navButtonClick);
    btn.setAttribute('id', 'page-button-' + (i + 1));
    btn.setAttribute('class', 'nav_links__button');
    btn.setAttribute('data-page', i + 1);
    navLinks.appendChild(btn);
  }

  // load first set of movies
  loadMovies();
}

function switchToPageView(e) {
  document.querySelector('#list-view').classList.remove('active');
  e.target.classList.add('active');
  VIEW_MODE = 'PAGE_VIEW';
  // reset current page to 1
  QUERY_PARAMS.PAGE = 1;
  // clear all the elements in the DOM
  document.querySelector('.movies_section').innerHTML = '';

  var navLinksTop = document.querySelector('.nav_links_top');
  // make the navLink buttons visible in the page view
  navLinksTop.style.visibility = 'visible';
  // load fresh set of items
  loadMovies();
}

function switchToListView(e) {
  document.querySelector('#page-view').classList.remove('active');
  e.target.classList.add('active');
  VIEW_MODE = 'LIST_VIEW';
  // reset page to 1
  QUERY_PARAMS.PAGE = 1;
  // clear all the elements in the dom
  document.querySelector('.movies_section').innerHTML = '';
  var navLinksTop = document.querySelector('.nav_links_top');
  // make the navLinks button invisible in list view
  navLinksTop.style.visibility = 'hidden';
  // load fresh set of items
  loadMovies();
}

// constructs card with all necessary classes and info
function constructCard(item) {
  var id = item.id || '';
  var name = item.name || '';
  var description = item.description || '';
  var imageLink = item.poster_path;
  var likesCount = item.like_count || 0;
  var price = item.price || '';

  var card = document.createElement('div');
  card.setAttribute('id', `${id}`);
  card.setAttribute('class', 'movie_card');
  card.innerHTML = `
    <div class="movie_card__inner">
      <div class="movie_card__front">
        <ul class="movie_card__ul">
          <li class="movie_card__li">
            <span class="like" data-content="${likesCount}">&hearts;</span>
          </li>
          <li class="movie_card__li buy">
            <span class="buy" data-content="${price}">More &#x2192;</span>
          </li>
        </ul>
        <p class="movie_card__title">${name}</p>
      </div>
      <div class="movie_card__back">
        <h1>${name}</h1>
        <p>${description}</p>
        <p>$ ${price}</p>
      </div>
    </div>
  `;

  card.setAttribute('class', 'movie_card');
  card.setAttribute('id', id);
  card.style.backgroundImage = `url(${imageLink})`;
  card.style.backgroundRepeat = 'no-repeat';
  card.style.backgroundPosition = 'center';
  card.style.backgroundOrigin = 'padding-box';

  return card;
}

// load movies depending on the either appends or clears and loads new movies
function loadMovies() {
  var moviesSection = document.querySelector('.movies_section');

  if (VIEW_MODE === 'PAGE_VIEW') {
    // show loading info to the user when fetch is in progress
    moviesSection.innerHTML = '<p>Loading</p>';

    ajaxRequest(function (items) {
      // clear the laoding info
      moviesSection.innerHTML = '';
      for (var i = 0; i < items.length; i++) {
        var card = constructCard(items[i]);
        moviesSection.append(card);
      }
    });
  } else {
    ajaxRequest(function (items) {
      // clear the items in the list view when user enters something in search bar
      // during list view
      if (QUERY_PARAMS.SEARCH && QUERY_PARAMS.PAGE === 1) {
        moviesSection.innerHTML = '';
      }
      for (var i = 0; i < items.length; i++) {
        var card = constructCard(items[i]);
        moviesSection.append(card);
      }
    });
  }
}

function handleSort(e) {
  if (e.target.value === 'none') {
    QUERY_PARAMS.SORT = '';
  } else {
    QUERY_PARAMS.SORT = e.target.value;
  }
  QUERY_PARAMS.PAGE = 1;

  loadMovies();
}

function handleSortOrder(e) {
  if (e.target.id === 'sort-asc') {
    document.querySelector('#sort-desc').classList.remove('active');
    e.target.classList.add('active');
    QUERY_PARAMS.ORDER = 'asc';
  } else {
    document.querySelector('#sort-asc').classList.remove('active');
    e.target.classList.add('active');
    QUERY_PARAMS.ORDER = 'desc';
  }
  QUERY_PARAMS.PAGE = 1;

  loadMovies();
}

function ajaxRequest(callback, resource) {
  var uri = urlGenerator(resource);
  fetch(uri)
    .then((res) => res.json())
    .then((data) => {
      callback(data);
    })
    .catch((error) => console.log(error));
  // xmlHttpRequest could have also been used here
}

// depending on the query params, constructs url and returns to ajaxRequest function
function urlGenerator(resource) {
  // default url to call
  var url = 'http://localhost:4010/';
  if (resource !== undefined) {
    url += 'info';
    return url;
  }
  url += 'items';

  if (QUERY_PARAMS.PAGE) {
    url += `?_page=${QUERY_PARAMS.PAGE}&_limit=${PAGINATION_LIMIT}`;
  }

  if (QUERY_PARAMS.SEARCH) {
    url += `&name_like=${QUERY_PARAMS.SEARCH}`;
  } else if (!QUERY_PARAMS.PAGE && QUERY_PARAMS.SEARCH) {
    url += `?name_like=${QUERY_PARAMS.SEARCH}`;
  }

  if (QUERY_PARAMS.SORT) {
    url += `&_sort=${QUERY_PARAMS.SORT}&_order=${QUERY_PARAMS.ORDER}`;
  } else if (!QUERY_PARAMS.PAGE && QUERY_PARAMS.SEARCH) {
    url += `?_sort=${QUERY_PARAMS.SORT}&_order=${QUERY_PARAMS.ORDER}`;
  }

  return url;
}
