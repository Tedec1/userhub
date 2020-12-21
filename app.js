const BASE_URL = 'https://jsonplace-univclone.herokuapp.com';

function fetchMore(addOn){
	return fetch(`${BASE_URL}/${addOn}`)
		.then(function (data){
			return data.json();
		})
		.catch(function (error){
			console.error(error);
		})
}

function fetchUsers() {
    return fetchMore('users');
}


function renderUser(user) {
  return $(`<div class="user-card">
    <header>
      <h2>${user.name}</h2>
    </header>
    <section class="company-info">
      <p><b>Contact:</b> ${user.email}</p>
      <p><b>Works for:</b> ${user.company.name}</b></p>
      <p><b>Company creed:</b> "${user.company.catchPhrase}, which will ${user.company.bs}!"</p>
    </section>
    <footer>
      <button class="load-posts">POSTS BY ${user.username}</button>
      <button class="load-albums">ALBUMS BY ${user.username}</button>
    </footer>
  </div>`).data('user', user);
}

function renderUserList(userList) {
	$('#user-list').empty();
  userList.forEach(element => {
    $('#user-list').append(
      renderUser(element)
    )
  });
}

function fetchUserAlbumList(userId) {
	return fetchMore(`users/${userId}/albums?_expand=user&_embed=photos`);
}


function renderAlbum(album) {
	return album.map(function (photo) {
		return renderPhoto(photo);
	}).join('');
}

function renderPhoto(photo) {
	return `<div class="photo-card">
	<a href=${photo.url} target="_blank">
	  <img src="${photo.thumbnailUrl}">
	  <figure>${photo.title}</figure>
	</a>
  </div>`
}

function renderAlbumList(albumList) {
	$('#instructions').removeClass('active')
	$('#album-list').empty().addClass('active')
	$('#post-list').empty().removeClass('active')
	
	albumList.forEach(album => {
		$('#album-list').append(`<div class="album-card">
			<header>
			  <h3>${album.title} by ${album.user.name} </h3>
			</header>
			<section class="photo-list">
			${renderAlbum(album.photos)}
			</section>
		  </div>`)
	});
}

function fetchUserPosts(userId) {
	return fetchMore(`users/${ userId }/posts?_expand=user`);
}
  

function fetchPostComments(postId) {
	return fetchMore(`posts/${ postId }/comments`);
}

function setCommentsOnPost(post) {
	// post.comments might be undefined, or an []
	if(post.comments){
		Promise.reject(null);
	} 
	return fetchPostComments(post.id)
		.then(function(comments){
			post.comments = comments;
    		return post;
		})
}

function renderPostList(postList) {
	$('#instructions').removeClass('active')
	$('#album-list').empty().removeClass('active')
	$('#post-list').empty().addClass('active')
	postList.forEach(function (post) {
	  $('#post-list').append(renderPost(post));
	});
}

function toggleComments(postCardElement) {
	const footerElement = postCardElement.find('footer');
  
	if (footerElement.hasClass('comments-open')) {
	  footerElement.removeClass('comments-open');
	  footerElement.find('.verb').text('show');
	} else {
	  footerElement.addClass('comments-open');
	  footerElement.find('.verb').text('hide');
	}
}

$('#post-list').on('click', '.post-card .toggle-comments', function () {
	const postCardElement = $(this).closest('.post-card');
	const post = postCardElement.data('post');
	const commentList = postCardElement.find('.comment-list');
	setCommentsOnPost(post)
    .then(function (post) {
      console.log('building comments for the first time...')
      
      commentList.empty();
      post.comments.forEach(function (comment) {
        commentList.prepend($(`
          <h3>${ comment.body } --- ${ comment.email }</h3>
        `));
      });
      toggleComments(postCardElement);
    })
    .catch(function () {
      console.log('comments previously existed, only toggling...')
      
      toggleComments(postCardElement);
    });
});
function renderPost(post) {
	return $(`<div class="post-card">
	  <header>
		<h3>${ post.title }</h3>
		<h3>--- ${ post.user.username }</h3>
	  </header>
	  <p>${ post.body }</p>
	  <footer>
		<div class="comment-list"></div>
		<a href="#" class="toggle-comments">(<span class="verb">show</span> comments)</a>
	  </footer>
	</div>`).data('post', post)
}
  

$('#user-list').on('click', '.user-card .load-posts', function () {
  console.log($(this).closest());
  const user = $(this).closest('.user-card').data('user');
	fetchUserPosts(user.id).then(renderPostList)
  
});

$('#user-list').on('click', '.user-card .load-albums', function () {
	console.log($(this).closest());
	const user = $(this).closest('.user-card').data('user');
	fetchUserAlbumList(user.id)
    .then(renderAlbumList);
});

function bootstrap(){
	fetchUsers().then(renderUserList);
}

bootstrap();


fetchUserPosts(1).then(console.log);
fetchPostComments(1).then(console.log);