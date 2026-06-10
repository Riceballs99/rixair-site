window.addEventListener("DOMContentLoaded", function(){

	var v = $('#gjs-dev').data('values') !== undefined ? $('#gjs-dev').data('values') : '{}';
	var scriptData = typeof v === 'object' ? v : JSON.parse(v);
	//Form Stylization
	function formStylization() {
	  var $        = jQuery,
		checkbox = 'input[type="checkbox"]';


		$(checkbox).each(function(){

		  if(!$(this).hasClass('styleApplied')){
			$(this).addClass('styleApplied').wrap('<div class="new-checkbox fl"></div>');
		  }

		})
		$(checkbox + ':checked').parent('.new-checkbox').addClass('checked');


		$(checkbox + ':disabled').parent().addClass('disabled');
		$('html').on('click', function(e){

			$(checkbox).parent('.new-checkbox').removeClass('checked');
			$(checkbox + ':checked').parent('.new-checkbox').addClass('checked');
			$(checkbox).parents('.setCompare').addClass('ignoreChecked');

			$(checkbox).parent().removeClass('disabled');
			$(checkbox + ':disabled').parent().addClass('disabled');
		});

	}

	formStylization();
	/*function shortDescriptionViewMore()
	{
		if($('div.short-description').length){
				var elementContent = $('.short-description').html();

				var elementContent = elementContent.replace("<hr />", "<hr/>").replace("<hr>", "<hr/>").replace("<hr >", "<hr/>");
				var index = elementContent.indexOf("<hr/>");
				var first = elementContent.substr(0, index); // Gets the first part
				var second = elementContent.substr(index+5); //Gets second part
				var inpageText = '';
				if(first != '' && second != ""){
					inpageText += '<div>'+first+'</div>';
					inpageText += '<div class="sDescriptionSecondValue" style="display: none;">'+second+'</div>';
					inpageText += '<div><a href="#" class="displayMore productSDescriptionDisplay -g-no-url" style="float: right;" data-text-swap="'+scriptData.seeLess+'">'+scriptData.seeMore+'<a></div>';
					$('div.short-description').html(inpageText);
				}
				$('div.short-description').show();
			}

	}*/
	 $('div.catDesc').hide();
	$(document).ready(function(){
		/*grid*/
		$('.-g-listing-version-attribute-holder-carousel').owlCarousel({
			navigation:true,
			pagination:false,
			nestedItemSelector: '._versionAttributeImageGrid',
			items: 3,
			center: true,
			navigationText: ['<i class="fa fa-angle-left" aria-hidden="true"></i>','<i class="fa fa-angle-right" aria-hidden="true"></i>'],
			itemsCustom : [
				[0,2],[479,2],[768,3],[979,3],[1199,3]
			]
		});
		$(document).on('click', '._versionAttributeImageGrid ._versionAttributeGrid', function(){
			var image = $(this).data('imglist') ? $(this).data('imglist') : $(this).data('img');
			$(this).parents('.box-holder').find('.image-holder').find('img').attr('src', image);
		});
		/*grid*/
		if($('div.catDesc').length){
			var elementContent = $('.catDesc').html();

			var elementContent = elementContent.replace("<hr />", "<hr/>").replace("<hr>", "<hr/>").replace("<hr >", "<hr/>");
			var index = elementContent.indexOf("<hr/>");
			var first = elementContent.substr(0, index); // Gets the first part
			var second = elementContent.substr(index+5); //Gets second part
			var inpageText = '';
			if(first != '' && second != ""){
				inpageText += '<div>'+first+'</div>';
				inpageText += '<div class="descriptionSecondValue" style="display: none;">'+second+'</div>';
				inpageText += '<div><a href="#" class="displayMore categoryDescriptionDisplay -g-no-url" style="float: right;" data-text-swap="'+scriptData.seeLess+'">'+scriptData.seeMore+'<a></div>';
				$('div.catDesc').html(inpageText);
			}
			$('div.catDesc').show();
		}
		$(document).on('click', '.categoryDescriptionDisplay', function(){
			var el = $(this);
			if (el.text() == el.data("text-swap")) {
				el.text(el.data("text-original"));
			} else {
				el.data("text-original", el.text());
				el.text(el.data("text-swap"));
			}
			$('.descriptionSecondValue').slideToggle();
		})

		/*if($('div._descriptionTab.__showDescription').length){
			var elementContent = $('._descriptionTab.__showDescription').html();

			var elementContent = elementContent.replace("<hr />", "<hr/>").replace("<hr>", "<hr/>").replace("<hr >", "<hr/>");
			var index = elementContent.indexOf("<hr/>");
			var first = elementContent.substr(0, index); // Gets the first part
			var second = elementContent.substr(index+5); //Gets second part
			var inpageText = '';
			if(first != '' && second != ""){
				inpageText += '<div>'+first+'</div>';
				inpageText += '<div class="descriptionSecondValue" style="display: none;">'+second+'</div>';
				inpageText += '<div><a href="#" class="displayMore productDescriptionDisplay -g-no-url" style="float: right;" data-text-swap="'+scriptData.seeLess+'">'+scriptData.seeMore+'<a></div>';
				$('div._descriptionTab.__showDescription').html(inpageText);
			}
			$('div._descriptionTab.__showDescription').show();
		}
		$(document).on('click', '.productDescriptionDisplay', function(){
			var el = $(this);
			if (el.text() == el.data("text-swap")) {
				el.text(el.data("text-original"));
			} else {
				el.data("text-original", el.text());
				el.text(el.data("text-swap"));
			}
			$('.descriptionSecondValue').slideToggle();
		})*/
		//shortDescriptionViewMore();

		$(document).on('click', '.productSDescriptionDisplay', function(){
			var el = $(this);
			if (el.text() == el.data("text-swap")) {
				el.text(el.data("text-original"));
			} else {
				el.data("text-original", el.text());
				el.text(el.data("text-swap"));
			}
			$('.sDescriptionSecondValue').slideToggle();
		})
		var logoImgCss = $('#logo>img.img-responsive').css('content');

		if(logoImgCss != undefined && logoImgCss && logoImgCss != 'none' && logoImgCss != 'normal'){

			var logoImgCss = (logoImgCss.replace('url("','').replace('")', '').replace(')', '').replace('url(', ''));
			if(logoImgCss != 'normal'){
				$('#logo>img.img-responsive').attr('src', logoImgCss);
			}
		}
	})

		/* Script pastrare pozitie scroll in pagina de categorie */
		if ($(window).width() < 768){
			if (sessionStorage.getItem('scrollpos') && $('link[rel=canonical]').attr('href') == sessionStorage.getItem('canonical-page')){
				$(window).scrollTop(sessionStorage.getItem('scrollpos'));
				sessionStorage.removeItem('scrollpos');
				sessionStorage.removeItem('canonical-page');
			}
			$('.__GomagListingProductBox').on('click', function(){
				sessionStorage.setItem('scrollpos',$(window).scrollTop());
				sessionStorage.setItem('canonical-page',$('link[rel=canonical]').attr('href'));
			});
		}

		/* Trigger autocomplete la paste */
		$('input[autocomplete]').on('paste', function() {
			let target = $(this);
			setTimeout(function() {$(target).trigger('keyup');}, 100);
		});

		$('.menu-trg').on('click', function(){
			if ( $('.mm-mobile-menu .slide-item-menu').length ) {
				$('.slide-item-menu').owlCarousel({items:1,navigation:!0,pagination:!1});
				var owl = $('.slide-item-menu');
				var owlInstance = owl.data('owlCarousel');
				if(owlInstance != null)
				owlInstance.reinit();
			};
		
		});

		if($( window ).width() > 768 && $('#category-page').length && $('#category-page .filter-group').length){
			if(window.getComputedStyle($('#category-page .filter-group')[0]).position === 'sticky'){
				var header = $('.main-header');
				var navigation = $('.main-header #navigation');
				var stickyFilters = $('#category-page .filter-group');
				var filterHeight = stickyFilters.height();
				var categoryContent = $('#category-page .category-content:has(.result-section)');
				var categoryHead = $('#category-page .category-content:has(.catTitle)');
				var prevScroll = $(window).scrollTop();
				var offset = 0;
		
				function adjustSticky() {
					var headerHeight = window.getComputedStyle($('.main-header #navigation')[0]).position === 'absolute' ? header.height() + navigation.height() + 25 : header.height() + 25;
					var categoryHeight = categoryContent.height() + categoryHead.height();
					var windowHeight = $(window).height();
					var currentScroll = $(this).scrollTop();
					var minOffset = windowHeight - filterHeight;
		
					if (categoryHeight >= windowHeight && filterHeight >= windowHeight && filterHeight < categoryHeight) {
						offset += (prevScroll - currentScroll);
					
						offset = Math.max(offset, minOffset);
						maxOffset = $('.main-header.active-menu').length ? headerHeight : 25;
						offset = Math.min(offset, maxOffset);
					
						stickyFilters.css('top', `${offset}px`);
					
						prevScroll = currentScroll;
					}
					
				}
				
				$(window).scroll(adjustSticky);
		
				$(window).resize(function() {
					adjustSticky();
				});
			}
		};

		$('.-g-show-password').on('click', function(){
			var input = $(this).siblings('input');
			if(input.attr('type') == 'password'){
				input.attr('type','text');
				$(this).find('i').removeClass('fa-eye-slash').addClass('fa-eye');
			} else {
				input.attr('type','password');
				$(this).find('i').removeClass('fa-eye').addClass('fa-eye-slash');
			}
		});
		
}, false)
