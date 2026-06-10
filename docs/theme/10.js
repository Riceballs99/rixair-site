$(document).ready(function () {

	if ($('.main-header .FH').length){
		// FASHION DEPTH  ==========
		var fullMenu = '';
		$('ul.base-menu li.ifDrop').each(function(){
			fullMenu = fullMenu + '<li class="menu-drop">'+$(this).html()+'</li>';
		});
		$('.nav-menu.base-menu').addClass('container-h');
		$('ul.base-menu li.all-product-button').remove();
		$('ul.base-menu').prepend(fullMenu);
		$('ul.base-menu li > a > i').removeClass('fa-angle-right');
		$('ul.base-menu li > a > i').addClass('fa-angle-down');
		$('ul.base-menu ul.drop-list').each(function(){
			if(!$(this).parent('div.menu-dd').length){
				$('<div class="menu-dd"> </div>').insertBefore($(this));
			}
		})
		$('div.menu-dd').each(function(){
			var image = $(this).next('ul.drop-list').find('li.image').html();
			var slider = $(this).next('ul.drop-list').find('li.slider-menu').html();
			$(this).next('ul.drop-list').find('li.image').remove();
			$(this).next('ul.drop-list').find('li.slider-menu').remove();
			var subcat = $(this).next('ul.drop-list').html();
			if(subcat != undefined){
				var w = $(this).next('ul.drop-list').hasClass('w60') ? 'w60' : 'w100';
				$(this).next('ul.drop-list').remove();
				$(this).append('<ul class="drop-list clearfix '+w+'">'+subcat+'</ul>');
				if ( $(image).length ) {
					$(this).append('<div class="cat-img fr">'+image+'</div>');
				}
				if ( $(slider).length ) {
					$(this).append('<div class="slider-menu fl w100">'+slider+'</div>');
				}
			}
		});

		// BASE MENU  ==========
		$('ul.base-menu').show();
	};

	// FASHION MENU ==========
	function Menu(){
		$('.menu-dd').each(function() {
			var $this = $(this);
			var Nli = $this.find('li').length;
			var Nlink = $this.find('a').length;
			var Ncol = Math.ceil(Nlink / 15);
			var Mbanner = $this.find('.cat-img').length;

			Ncol = Ncol == 0 ? 1 : Ncol;
			col = Nli > Ncol ? Ncol : Nli;
			col = (col + (Mbanner ? 1 : 0) > 4) ? 4 : col;
			$this.addClass('column' + col);
			if (Mbanner){$this.addClass('banner');};
			if ($this.find('li span > a').length == 0){
				$this.addClass('no-sub');
			};
		});
	};
	Menu();

	$('.main-header .menu-drop').hover(function() {
		$('.main-header .menu-drop .menu-dd').removeClass('open');
		$(this).children('.menu-dd').stop().addClass('open');
		if ( $('.slide-item-menu').length ) {
			$('.slide-item-menu').owlCarousel({items:1,navigation:!0,pagination:!1});

			// get owl element
			var owl = $('.slide-item-menu');

			// get owl instance from element
			var owlInstance = owl.data('owlCarousel');

			// if instance is existing
			if(owlInstance != null)
			owlInstance.reinit();
		};
	},function() {
		$('.main-header .menu-drop .menu-dd').removeClass('open');
	});

	// BF SIDEBAR + MENU STICKY
	// $.Gomag.bind('Widget/Add/After', function(){
	// 	if($('.-g-template-black-friday').length){
	// 		$('.main-header').css({'top' : '-' + ($('.discount-tape').height() + $('.top-head-bg').height()) + 'px'});
	// 	}
	// 	if($( window ).width() > 991 && $('.-g-template-black-friday').length){
	// 		$('.landing-h .side-menu.fixed').css({'top' : $('#navigation').outerHeight() + 20 + 'px'});
	// 	}
	// });

	$('#nav-filter:not(.mm-nav-filter) .option-group').addClass('ignoreMore');
	//toggle filter
	$(document).on('click', '#nav-filter:not(.mm-nav-filter) .filter.box .title-h', function(e){
		e.preventDefault();
		$(this).addClass('ignore');
		$('#nav-filter:not(.mm-nav-filter) .filter.box .title-h').each(function(){
			if(!$(this).hasClass('ignore')){
				$(this).removeClass('ttl-bg')
			}
		})
		$(this).removeClass('ignore');
		$(this).toggleClass('ttl-bg');

		$(this).next().addClass('ignoreSlide');
		$('#nav-filter:not(.mm-nav-filter) .option-group').each(function(){
			if(!$(this).hasClass('ignoreSlide')){
				$(this).hide();
			}
		})
		$(this).next().removeClass('ignoreSlide');
		$(this).next().toggle();
	});
	$(document).mouseup(function(e) {
		var container = $('#nav-filter:not(.mm-nav-filter) .filter.box:not(.-g-category-filters-remove-all)');
		if (!container.is(e.target) && container.has(e.target).length === 0){
			$(this).find('.option-group').removeClass('ignore').hide();
			$(this).find('.title-h').removeClass('ttl-bg');
		}
	});

	//change filter holder
	$('#nav-filter:not(.mm-nav-filter) .filter.box:not(.-g-category-filters-remove-all):not(.-g-category-filters-apply-all)').each(function(){
		var filterh = $(this).html();
		$(this).find('.title-h,.option-group,.more-filter').remove();
		$(this).prepend('<div class="filter-h">'+filterh+'</div>');
	});

	if ($(window).width() > 768) {
		$('.result-section .order-type').appendTo('.filter-group:not(.mm-nav-filter) .filter-holder');
		$('.order-type').addClass('filter box');
		$('.list-grid').insertAfter('.order-type');
	};
	//footer holder
	if ($('.bottom-section').length){
		$('.bottom-section').before('<div class="footer-holder"><div class="append-footer"></div></div>');
		$('.bottom-section').insertAfter('.append-footer');
		$('footer').insertAfter('.bottom-section');
	}else{
		$('footer').before('<div class="footer-holder"><div class="append-footer"></div></div>');
		$('footer').insertAfter('.append-footer');
	}

	$('.hellobar-itc').insertBefore('.top-head-bg');
	var hellobar_2 = $('.hellobar-fashion').detach();
	$('.main-header').append(hellobar_2);
});

function adjustMenuPosition() {
	$('.nav-menu-hh .menu-dd').each(function() {
		$(this).css('left', 0);

		const menudd = $(this)[0].getBoundingClientRect();

		if (menudd.right >= window.innerWidth - 60) {
			const offset = menudd.right - window.innerWidth + 60;
			$(this).css('left', `-${offset}px`);
		} else {
			$(this).css('left', 0);
		}
	});
}

window.onload = function() {
	adjustMenuPosition();
};