// Biáº¿n khá»Ÿi táº¡o
var timeOut_modalCart;
var viewout = true;
var check_show_modal = true;
if(window.template.indexOf('product') > -1){
	// Add a product and show modal cart
	var add_item_show_modalCart = function(id,link_checkout) {
		if( check_show_modal ) {
			check_show_modal = false;
			timeOut_modalCart = setTimeout(function(){ 
				check_show_modal = true;
			}, 3000);
			if ( $('.addtocart-modal').hasClass('clicked_buy') ) {
				var quantity = $('#quantity').val();
			} else {
				var quantity = 1;
			}
			var params = {
				type: 'POST',
				url: '/cart/add.js',
				async: true,
				data: 'quantity=' + quantity + '&id=' + id,
				dataType: 'json',
				success: function(line_item) {
					if(link_checkout != undefined){
						window.location = "/checkout";
					}
					else{
						getCartModal();					
						jQuery('#myCart').modal('show');				
						jQuery('.modal-backdrop').css({'height':jQuery(document).height(),'z-index':'99'});
					}
					$('.addtocart-modal').removeClass('clicked_buy');
				},
				error: function(XMLHttpRequest, textStatus) {
					alert('Sáº£n pháº©m báº¡n vá»«a mua Ä‘Ă£ vÆ°á»£t quĂ¡ tá»“n kho');
				}
			};
			jQuery.ajax(params);
		}
	}
	// Plus number quantiy product detail 
	var plusQuantity = function() {
		if ( jQuery('input[name="quantity"]').val() != undefined ) {
			var currentVal = parseInt(jQuery('input[name="quantity"]').val());
			if (!isNaN(currentVal)) {
				jQuery('input[name="quantity"]').val(currentVal + 1);
			} else {
				jQuery('input[name="quantity"]').val(1);
			}
		}else {
			console.log('error: Not see elemnt ' + jQuery('input[name="quantity"]').val());
		}
	}
	// Minus number quantiy product detail 
	var minusQuantity = function() {
		if ( jQuery('input[name="quantity"]').val() != undefined ) {
			var currentVal = parseInt(jQuery('input[name="quantity"]').val());
			if (!isNaN(currentVal) && currentVal > 1) {
				jQuery('input[name="quantity"]').val(currentVal - 1);
			}
		}else {
			console.log('error: Not see elemnt ' + jQuery('input[name="quantity"]').val());
		}
	}
	}
// Modal Cart
function getCartModal(){
	var cart = null;
	jQuery('#cartform').hide();
	jQuery('#myCart #exampleModalLabel').text("Giá» hĂ ng");
	jQuery.getJSON('/cart.js', function(cart, textStatus) {
		if(cart) {
			jQuery('#cartform').show();
			//jQuery('.line-item:not(.original)').remove();
			jQuery.each(cart.items,function(i,item){
				var total_line = 0;
				var total_line = item.quantity * item.price;
				tr = jQuery('.original').clone().removeClass('original').appendTo('table#cart-table tbody');
				if(item.image != null)
					tr.find('.item-image').html("<img src=" + Haravan.resizeImage(item.image,'small') + ">");
				else
					tr.find('.item-image').html("<img src='//theme.hstatic.net/1000096703/1000836887/14/no_image.jpg?v=241'>");
				vt = item.variant_options;
				if(vt.indexOf('Default Title') != -1)
					vt = '';
				tr.find('.item-title').children('a').html(item.product_title + '<br><span>' + vt + '</span>').attr('href', item.url);
				tr.find('.item-quantity').html("<input id='quantity1' name='updates[]' min='1' type='number' value=" + item.quantity + " class='' />");
				if ( typeof(formatMoney) != 'undefined' ){
					tr.find('.item-price').html(Haravan.formatMoney(total_line, formatMoney));
				}else {
					tr.find('.item-price').html(Haravan.formatMoney(total_line, ''));
				}
				tr.find('.item-delete').html("<a href='javascript:void(0);' onclick='deleteCart(" + (i+1) + ")' ><i class='fa fa-times'></i></a>");
			});
			jQuery('.item-total').html(Haravan.formatMoney(cart.total_price, formatMoney));
			jQuery('.modal-title').children('b').html(cart.item_count);
			jQuery('.count-holder .count').html(cart.item_count);

			if(cart.item_count == 0){				
				jQuery('#exampleModalLabel').html('Giá» hĂ ng cá»§a báº¡n Ä‘ang trá»‘ng. Má»i báº¡n tiáº¿p tá»¥c mua hĂ ng.');
				jQuery('#cart-view').html('<tr><td>Hiá»‡n chÆ°a cĂ³ sáº£n pháº©m</td></tr>');
				jQuery('#cartform').hide();
			}
			else{			
				jQuery('#exampleModalLabel').html('Báº¡n cĂ³ ' + cart.item_count + ' sáº£n pháº©m trong giá» hĂ ng.');
				jQuery('#cartform').removeClass('hidden');
				jQuery('#cart-view').html('');
			}
			if ( jQuery('#cart-pos-product').length > 0 ) {
				jQuery('#cart-pos-product span').html(cart.item_count + ' sáº£n pháº©m');
			}
			// Get product for cart view

			jQuery.each(cart.items,function(i,item){
				clone_item(item,i);
			});
			jQuery('#total-view-cart').html(Haravan.formatMoney(cart.total_price, formatMoney));
		} 	
	});
	$('#site-overlay').addClass("active");
	$('.main-body').addClass("sidebar-move");
	$('#site-nav--mobile').addClass("active");
	$('#site-nav--mobile').removeClass("show-filters").removeClass("show-search").addClass("show-cart");
}
//clone item cart
function clone_item(product,i){
	var item_product = jQuery('#clone-item-cart').find('.item_2');
	if ( product.image == null ) {
		item_product.find('img').attr('src','//theme.hstatic.net/1000096703/1000836887/14/no_image.jpg?v=241').attr('alt', product.url);
	} else {
		item_product.find('img').attr('src',Haravan.resizeImage(product.image,'small')).attr('alt', product.url);
	}
	item_product.find('a:not(.remove-cart)').attr('href', product.url).attr('title', product.title);
	item_product.find('.pro-title-view').html(product.title);
	item_product.find('.pro-quantity-view').html(product.quantity);
	item_product.find('.pro-price-view').html(Haravan.formatMoney(product.price,formatMoney));
	item_product.find('.remove-cart').html("<a href='javascript:void(0);' onclick='deleteCart(" + (i+1) + ")' ><i class='fa fa-times'></i></a>");
	var title = '';
	if(product.variant_options.indexOf('Default Title') == -1){
		$.each(product.variant_options,function(i,v){
			title = title + v + ' / ';
		});
		title = title + '@@';
		title = title.replace(' / @@','')
		item_product.find('.variant').html(title);
	}else {
		item_product.find('.variant').html('');
	}
	item_product.clone().removeClass('hidden').prependTo('#cart-view');
}
// Delete variant in modalCart
function deleteCart(line){
	var params = {
		type: 'POST',
		url: '/cart/change.js',
		data: 'quantity=0&line=' + line,
		dataType: 'json',
		success: function(cart) {
			getCartModal();
		},
		error: function(XMLHttpRequest, textStatus) {
			Haravan.onError(XMLHttpRequest, textStatus);
		}
	};
	jQuery.ajax(params);
}
// Update product in modalCart
jQuery(document).on("click","#update-cart-modal",function(event){
	event.preventDefault();
	if (jQuery('#cartform').serialize().length <= 5) return;
	jQuery(this).html('Äang cáº­p nháº­t');
	var params = {
		type: 'POST',
		url: '/cart/update.js',
		data: jQuery('#cartform').serialize(),
		dataType: 'json',
		success: function(cart) {
			if ((typeof callback) === 'function') {
				callback(cart);
			} else {
				getCartModal();
			}
			jQuery('#update-cart-modal').html('Cáº­p nháº­t');
		},
		error: function(XMLHttpRequest, textStatus) {
			Haravan.onError(XMLHttpRequest, textStatus);
		}
	};
	jQuery.ajax(params);
});
// Buynow
var buy_now = function(id) {
	var quantity = 1;
	var params = {
		type: 'POST',
		url: '/cart/add.js',
		data: 'quantity=' + quantity + '&id=' + id,
		dataType: 'json',
		success: function(line_item) {
			if(template == 'cart'){
				var x = $('.layout-cart').offset().top;
				smoothScroll(x-100, 500);
				setTimeout(function(){
					window.location.reload();
				},300);
			}else{
				window.location = '/checkout';
			}
		},
		error: function(XMLHttpRequest, textStatus) {
			Haravan.onError(XMLHttpRequest, textStatus);
		}
	};
	jQuery.ajax(params);
}
// Add to cart
$(document).on('click','.add-to-cart', function() {
	var min_qty = 1;
	var variant_id = $(this).attr('data-variantid');
	var params = {
		type: 'POST',
		url: '/cart/add.js',
		async: true,
		data: 'quantity=' + min_qty + '&id=' + variant_id,
		dataType: 'json',
		success: function(line_item) {
			if (template.indexOf('cart') > -1) {
				window.location.reload();
			} else {
				getCartModal();
			}
		},
		error: function(XMLHttpRequest, textStatus) {
			Haravan.onError(XMLHttpRequest, textStatus);
		}
	};
	jQuery.ajax(params);
});
/* fixHeightProduct */
function fixHeightProduct(data_parent, data_target, data_image) {
	var box_height = 0;
	var box_image = 0;
	var boxtarget = data_parent + ' ' + data_target;
	var boximg = data_parent + ' ' + data_target + ' ' + data_image;
	jQuery(boximg).css('height', 'auto');
	jQuery($(boxtarget)).css('height', 'auto');
	jQuery($(boxtarget)).removeClass('fixheight');
	jQuery($(boxtarget)).each(function() {
		if (jQuery(this).find($(data_image)).height() > box_image) {
			box_image = jQuery(this).find($(data_image)).height();
		}
	});
	if (box_image > 0) {
		jQuery(boximg).height(box_image);
	}
	jQuery($(boxtarget)).each(function() {
		if (jQuery(this).height() > box_height) {
			box_height = jQuery(this).height();
		}
	});
	jQuery($(boxtarget)).addClass('fixheight');
	if (box_height > 0) {
		jQuery($(boxtarget)).height(box_height);
	}
	try {
		fixheightcallback();
	} catch (ex) {}
}
jQuery(document).ready(function(){
	// Get number item for cart header
	//$.get('/cart.js').done(function(cart){
	//$('.cart-menu .count').html(cart.item_count);
	//});
	// Image Product Loaded fix height
	jQuery('.list-productRelated .content-product-list .image-resize').imagesLoaded(function() {
		fixHeightProduct('.list-productRelated .content-product-list', '.product-resize', '.image-resize');
		jQuery(window).resize(function() {
			fixHeightProduct('.list-productRelated .content-product-list', '.product-resize', '.image-resize');
		});
	});
	jQuery('.search-list-results .image-resize').imagesLoaded(function() {
		fixHeightProduct('.search-list-results', '.product-resize', '.image-resize');
		jQuery(window).resize(function() {
			fixHeightProduct('.search-list-results', '.product-resize', '.image-resize');
		});
	});
	jQuery('#collection-body .content-product-list .image-resize').imagesLoaded(function() {
		fixHeightProduct('#collection-body .content-product-list', '.product-resize', '.image-resize');
		jQuery(window).resize(function() {
			fixHeightProduct('#collection-body .content-product-list', '.product-resize', '.image-resize');
		});
	});	
});

//Click event to scroll to top
jQuery(document).on("click", ".back-to-top", function(){
	jQuery(this).removeClass('show');
	jQuery('html, body').animate({
		scrollTop: 0			
	}, 800);
});
/* scroll */
jQuery(window).scroll(function() {
	/* scroll top */
	if ( jQuery('.back-to-top').length > 0 && jQuery(window).scrollTop() > 500 ) {
		jQuery('.back-to-top').addClass('show');
	} else {
		jQuery('.back-to-top').removeClass('show');
	}

});
$('a[data-spy=scroll]').click(function(){
	event.preventDefault() ;
	$('body').animate({scrollTop: ($($(this).attr('href')).offset().top - 20) + 'px'}, 500);
})
function smoothScroll(a, b){
	$('body,html').animate({
		scrollTop : a
	}, b);
}
jQuery(document).ready(function(){
	if( template.indexOf('index') > -1){
		// slideText top
		if($("#slideText p").length > 1){
			jQuery(function() {
				jQuery("#slideText > p:gt(0)").hide();
				setInterval(function() { 
					jQuery('#slideText > p:first').fadeOut(1000).next().fadeIn(1000).end().appendTo('#slideText');
				},  3000);
			});
		}
		// Slide
		$('#home-slider .owl-carousel').owlCarousel({
			items:1,
			autoplay: 3000,
			nav: false,
			dots: true,
			lazyLoad:true,
			mouseDrag:true,
			touchDrag:true,
			loop: true,	
			animateIn: 'scaleSlide',
			smartSpeed:1000,		
			//	autoplay: 1500,
			responsive:{
				0:{
					items:1
				},
				480:{
					items:1
				},
				768:{
					items:1
				},
				992:{
					items:1
				},
				1200:{
					items:1
				}
			}
		});
		if (jQuery(window).width() > 767) {
			if ($('#homeCarousel-collection-1').length > 0 || $('#homeCarousel-collection-3').length > 0) {
				$('#homeCarousel-collection-1,#homeCarousel-collection-3').owlCarousel({
					items:4,
					nav:true,
					dots:false,
					responsive:{
						0:{
							items:2,
							margin: 15
						},
						480:{
							items:2,
							margin: 15
						},
						768:{
							items:3,
							margin: 15
						},
						992:{
							items:4,
							margin: 30
						},
						1200:{
							items:4,
							margin: 30
						}
					},
					pagination: false,
					slideSpeed : 800,
					addClassActive: true,
					scrollPerPage: false,
					touchDrag: true,
					autoplay: false,
					loop: false,
					lazyLoad: true,
				});
			}
			if ($('#homeCarousel-collection-2').length > 0) {
				$('#homeCarousel-collection-2').owlCarousel({
					items:1,
					nav:true,
					dots:false,
					pagination: false,
					smartSpeed:1000,		
					addClassActive: true,
					scrollPerPage: false,
					touchDrag: true,
					mouseDrag:false,
					autoplay: false,
					loop: false,
					lazyLoad: true,

					animateIn: 'fadeIn',
					animateOut: 'fadeOut',
				});
			}	
			var owl_tab = $('.tabs-products .tab-item.active .carousel-tabs');
			owl_tab.owlCarousel({
				items:4,
				nav:true,
				margin: 0,
				lazyLoad:true,
				responsive:{
					0:{
						items:2,
						margin: 15
					},
					480:{
						items:2,
						margin: 15
					},
					768:{
						items:3,
						margin: 15
					},
					992:{
						items:4,
						margin: 30
					},
					1200:{
						items:4,
						margin: 30
					}
				}
			});
		}
		// scroll down section home
		$(".slider-circle-scroll .scroll-downs").click(function(e) {
			e.preventDefault();
			jQuery('html, body').animate({
				scrollTop: jQuery(this).parents('.section-slider').next().offset().top - 40
			}, 600);
		});
		/*-- POPUP LOAD */
		if($("#popup-contact").length > 0){
			setTimeout(function(){
				if(sessionStorage.mega_popup == null ){
					$('#popup-contact').modal('show');
				}
			},1000);
			if ($('.popupForm').length > 0){
				$('.popup-form-customer .form-customer').submit(function(e){
					e.preventDefault();
					var email = $('input#contact_email').val();	
					$.ajax({
						type: 'POST',
						url:'/account/contact',
						dataType:'json',
						data:{
							form_type:"customer",
							utf8: "âœ“",
							contact: {
								"first_name":  'ÄÄƒng kĂ­',
								"last_name": 'Popup',
								"email": email,
								"tags":"Popup Form"
							}},
						success:function(){}
					})
					setTimeout(function(){ 
						$('#popup-contact').modal('hide');
						location.reload();
					},1000);
					if(sessionStorage.mega_popup == null ){
						sessionStorage.mega_popup = 'show' ;
					}
				});
			}
			else{
				$(document).on('click','.linkbanner-popup-contact', function(){
					$('#popup-contact').modal('hide');
					if(sessionStorage.mega_popup == null ){
						sessionStorage.mega_popup = 'show' ;
					}
				});
			}
			$(document).on('click','.modal-popupContact .close-popup-contact', function(e){
				e.preventDefault();
				$('#popup-contact').modal('hide');
				if(sessionStorage.mega_popup == null ){
					sessionStorage.mega_popup = 'show' ;
				}
			});
			$(".modal-popupContact").on('hidden.bs.modal', function(){
				if(sessionStorage.mega_popup == null ){
					sessionStorage.mega_popup = 'show' ;
				}
			});
		}
	}
	if (template.indexOf('collection') > -1) {
		// Dropdown Title
		jQuery('.title_block').click(function(){
			$(this).next().slideToggle('medium');
		});    
		$(document).on("click",".dropdown-filter", function(){
			if ( $(this).parent().attr('aria-expanded') == 'false' ) {
				$(this).parent().attr('aria-expanded','true');
			} else {
				$(this).parent().attr('aria-expanded','false');
			}
		});
	}
	/* Mainmenu sidebar */
	$(document).on("click", "span.icon-subnav", function(){
		if ($(this).parent().hasClass('active')) {
			$(this).parent().removeClass('active');
			$(this).siblings('ul').slideUp();
		} else {	

			if( $(this).parent().hasClass("nav-level0") || $(this).parent().hasClass("nav-level1")){
				$(this).parent().siblings().find("ul").slideUp();
				$(this).parent().siblings().removeClass("active");
			}

			$(this).parent().addClass('active');
			$(this).siblings('ul').slideDown();
		}
	});
	/* Menu sidebar */
	$('.plus-nClick1').click(function(e){
		e.preventDefault();
		$(this).parents('.level0').toggleClass('opened');
		$(this).parents('.level0').children('ul').slideToggle(200);
	});
	$('.plus-nClick2').click(function(e){
		e.preventDefault();
		$(this).parents('.level1').toggleClass('opened');
		$(this).parents('.level1').children('ul').slideToggle(200);
	});
	/**/
	if (jQuery(window).width() < 768) {
		jQuery('.main-footer .footer-col .footer-title').on('click', function(){
			jQuery(this).toggleClass('active').parent().find('.footer-content').stop().slideToggle('medium');
		});
		// icon Footer
		$('a.btn-fter').click(function(e){
			if ( $(this).attr('aria-expanded') == 'false' ) {
				e.preventDefault();
				$(this).attr('aria-expanded','true');
				$('.main-footer').addClass('bg-active');
			} else {
				$(this).attr('aria-expanded','false');
				$('.main-footer').removeClass('bg-active');
			}
		});
	}
});
jQuery(document).on("click", "#ajax-tab-collection > li:not(.tabdrop), #ajax-tab-collection li .dropdown-menu > li", function(e) {
	var handle = jQuery(this).children('a').attr('data-handle');
	jQuery('.tabs-products .tab-item.active').find('.icon-loading.tab-index').show();
	if (jQuery('.tabs-products .tab-item.active').attr('data-get') == 'false' && handle != '') {
		jQuery.ajax({
			url: 'collections/' + handle + '?view=filter-tabhome&page=1',
			success:function(data){
				jQuery('.icon-loading.tab-index').hide();
				jQuery('.tabs-products .tab-item.active').attr('data-get','true').find('.carousel-tabs').append(data);						
				if (jQuery(window).width() > 767) {			
					var owl_tab = jQuery('.tabs-products .tab-item.active .carousel-tabs');
					owl_tab.owlCarousel({
						items:4,
						nav:true,
						margin: 0,
						lazyLoad:true,
						responsive:{
							0:{
								items:2,
								margin: 15
							},
							480:{
								items:2,
								margin: 15
							},
							768:{
								items:3,
								margin: 15
							},
							992:{
								items:4,
								margin: 30
							},
							1200:{
								items:4,
								margin: 30
							}
						}
					});

				}
				jQuery(window).resize();
			}
		});
	}
	else 	if (jQuery('.tabs-products .tab-item.active').attr('data-get') == 'false' && handle == '' ) {				
		jQuery.ajax({
			url: 'collections/all?view=noproduct',
			success:function(data){
				jQuery('.icon-loading.tab-index').hide();
				jQuery('.tabs-products .tab-item.active').attr('data-get','true').find('.carousel-tabs').append(data);						
				if(jQuery(window).width() > 767) {	
					var owl_tab = jQuery('.tabs-products .tab-item.active .carousel-tabs');
					owl_tab.owlCarousel({
						items:4,
						nav:true,
						margin: 0,
						lazyLoad:true,
						responsive:{
							0:{
								items:2,
								margin: 15
							},
							480:{
								items:2,
								margin: 15
							},
							768:{
								items:3,
								margin: 15
							},
							992:{
								items:4,
								margin: 30
							},
							1200:{
								items:4,
								margin: 30
							}

						}
					});

				}
				jQuery(window).resize();
			}
		});
	}
	jQuery(window).resize();		
	jQuery('.tabs-products .tab-item.active').find('.icon-loading.tab-index').hide();
});
/* Search ultimate destop -mobile*/
$('.ultimate-search').submit(function(e) {
	e.preventDefault();
	var q = $(this).find('input[name=q]').val();
	if(q.indexOf('script') > -1 || q.indexOf('>') > -1){
		alert('Tá»« khĂ³a cá»§a báº¡n cĂ³ chá»©a mĂ£ Ä‘á»™c háº¡i ! Vui lĂ²ng nháº­p láº¡i key word khĂ¡c');
		$(this).find('input[name=q]').val('');
	}
	else{
		var q_follow = 'product';				
		var query = encodeURIComponent('((title:product contains ' + q + ')||(sku:product**' + q + '))');
		if( !q ) {
			window.location = '/search?type='+ q_follow +'&q=*';
			return;
		}
		else {
			window.location = '/search?type=' + q_follow +'&q=filter=' + query;
			return;
		}
	}
});
var $input = $('.ultimate-search input[type="text"]');
$input.bind('keyup change paste propertychange', function() {
	var key = $(this).val(),
			$parent = $(this).parents('.wpo-wrapper-search'),
			$results = $(this).parents('.wpo-wrapper-search').find('.smart-search-wrapper');
	if(key.indexOf('script') > -1 || key.indexOf('>') > -1){
		alert('Tá»« khĂ³a cá»§a báº¡n cĂ³ chá»©a mĂ£ Ä‘á»™c háº¡i ! Vui lĂ²ng nháº­p láº¡i key word khĂ¡c');
		$(this).val('');
	}
	else{
		if(key.length > 0 ){
			$(this).attr('data-history', key);
			var q_follow = 'product',
					str = '';
			str = '/search?q=filter=(title:product contains ' + key + ')&view=ultimate-product';
			$.ajax({
				url: str,
				type: 'GET',
				async: true,
				success: function(data){
					$results.find('.resultsContent').html(data);
				}
			})
			$results.fadeIn();
		}else{
			$results.fadeOut();
		}
	}
})
$('input[name="follow"]').on('change', function(){
	$('.ultimate-search input[type="text"]').trigger('change');
})
$('input[name="follow_mobile"]').on('change', function(){
	$('.ultimate-search input[type="text"]').trigger('change');
})
$('body').click(function(evt) {
	var target = evt.target;
	if (target.id !== 'ajaxSearchResults' && target.id !== 'inputSearchAuto') {
		$(".ajaxSearchResults").hide();
	}
	if (target.id !== 'ajaxSearchResults-mb' && target.id !== 'inputSearchAuto-mb') {
		$(".ajaxSearchResults").hide();
	}
});
$('body').on('click', '.ultimate-search input[type="text"]', function() {
	if ($(this).is(":focus")) {
		if ($(this).val() != '') {
			$(".ajaxSearchResults").show();
		}
	} else {
	}
})
/* fixed header scroll */
jQuery(document).ready(function(){
	var $window = $(window);
	var $html   = $('html');
	var $body   = $('body');
	var $header = $('.main-body > header', $body);
	var $topheader = $('.articleToolbar');

	var offset_sticky_header  = 250;
	var offset_sticky_article = 350;
	var offset_down           = 100;


	$window.scroll(function() {

		if ($window.scrollTop() >= offset_sticky_header) {
			if (!$html.hasClass('sticky-header')) {
				$body.css('padding-top', $header.height());
				$html.addClass('sticky-header');
			}
		} else {
			$html.removeClass('sticky-header');
			$body.css('padding-top', 0);
		}

		if ($window.width() > 767) {
			if ($window.scrollTop() >= offset_sticky_article) {
				if (!$html.hasClass('sticky-article')) {	
					$topheader.css('top',$('.sticky-header .main-header').height());			
					$html.addClass('sticky-article');
				}
			} else {
				$topheader.css('top',$('.main-header').height());
				$html.removeClass('sticky-article');
			}
		}
		$body.toggleClass('down', $window.scrollTop() >= offset_down);
	}).scroll();

});
/*=======================================*/
jQuery(document).ready(function(){
	if ($('.addThis_listSharing').length > 0){
		$(window).scroll(function(){
			if(jQuery(window).scrollTop() > 100 ) {
				jQuery('.addThis_listSharing').addClass('is-show');
			} else {
				jQuery('.addThis_listSharing').removeClass('is-show');
			}
		});
		$('.content_popupform .form-modal').submit(function(e){
			e.preventDefault();
			var name = $('input#yourname').val();
			var email = $('input#youremail').val();
			var phone = $('input#yourphone').val();
			var message = $('#yourinfor').val(); 
			$.ajax({
				type: 'POST',
				url:'/contact',
				dataType:'json',
				data:{
					form_type:"contact",
					utf8: "âœ“",
					contact: {
						"name":  name,
						"email": email,
						"phone": phone,
						"body": message + '\n' + '&#42;&#42;&#42; Äá»ƒ láº¡i lá»i nháº¯n'
					}},
				success:function(){}
			})
			$('.modal-contactform.fade.in').modal('hide');
			setTimeout(function(){ 
				$('.modal-succes').modal('show');
			},300);
			setTimeout(function(){location.reload();}, 5000);
		});
	}
	if (jQuery(window).width() < 768 && $('.layoutProduct_scroll').length > 0 ) {
		var curScrollTop = 0;
		$(window).scroll(function(){	
			var scrollTop = $(window).scrollTop();
			if(scrollTop > curScrollTop  && scrollTop > 200 ) {
				$('.layoutProduct_scroll').removeClass('scroll-down').addClass('scroll-up');
			}
			else {
				if (scrollTop > 200 && scrollTop + $(window).height() + 150 < $(document).height()) {
					$('.layoutProduct_scroll').removeClass('scroll-up').addClass('scroll-down');	
				}
			}
			if(scrollTop < curScrollTop  && scrollTop < 200 ) {
				$('.layoutProduct_scroll').removeClass('scroll-up').removeClass('scroll-down');
			}
			curScrollTop = scrollTop;
		});
	}
});