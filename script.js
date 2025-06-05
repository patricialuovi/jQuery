$(document).ready(function () {
  const $theatreSelect = $('#theatreSelect');
  const $moviesContainer = $('#movies');
  const $searchInput = $('#searchInput');
  const $searchResult = $('#searchResult');
  const API_KEY = 'df730493';

  $.ajax({
    url: 'https://www.finnkino.fi/xml/TheatreAreas/',
    method: 'GET',
    dataType: 'xml',
    success: function (data) {
      $(data).find('TheatreArea').each(function () {
        const id = $(this).find('ID').text();
        const name = $(this).find('Name').text();
        $theatreSelect.append(`<option value="${id}">${name}</option>`);
      });
    }
  });

  $theatreSelect.on('change', function () {
    const theatreId = $(this).val();
    $moviesContainer.fadeOut(300, function () {
      $.ajax({
        url: `https://www.finnkino.fi/xml/Schedule/?area=${theatreId}`,
        method: 'GET',
        dataType: 'xml',
        success: function (data) {
          let shownTitles = new Set();
          $moviesContainer.empty();

          $(data).find('Show').each(function () {
            const title = $(this).find('Title').text();
            const img = $(this).find('EventSmallImagePortrait').text();
            const startTime = new Date($(this).find('dttmShowStart').text()).toLocaleString();

            if (shownTitles.has(title)) return;
            shownTitles.add(title);

            const movieHtml = `
              <div class="movie">
                <h3>${title}</h3>
                <img src="${img}" alt="${title}" />
                <p>Näytös alkaa: ${startTime}</p>
              </div>
            `;
            $moviesContainer.append(movieHtml);
          });

          $moviesContainer.hide().fadeIn(500);
        }
      });
    });
  });

  $searchInput.on('input', function () {
    const query = $searchInput.val().trim();
    if (query.length < 3) return;

    $.get(`https://www.omdbapi.com/?apikey=${API_KEY}&t=${encodeURIComponent(query)}`, function (data) {
      if (data.Response === 'True') {
        $searchResult
          .hide()
          .html(`
            <h2>${data.Title} (${data.Year})</h2>
            <img src="${data.Poster}" alt="${data.Title}" />
            <p>${data.Plot}</p>
          `)
          .slideDown();
      } else {
        $searchResult
          .hide()
          .html('<p>Ei tuloksia.</p>')
          .slideDown();
      }
    });
  });
});
