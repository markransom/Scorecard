
(function($) {
    if ($.jQTouch)
    {
        $.jQTouch.addExtension(function AutoTitles(jQT){
            
            var titleSelector='.toolbar h1';
            var backSelector='.back';

            $(function(){
                $('body').bind('pageAnimationStart', function(e, data){
                    var $title = $(titleSelector, $(e.target));
                    if (data.direction === 'in'){
                        var $ref = $(e.target).data('referrer');
			if ($title.length && $ref && $title.html() === ''){ 
                        	$title.html($ref.text());
                        }
	                var $back = $(backSelector, $(e.target));
			if ($back.text() === 'Teams'){ 
                        	sessionStorage.team=$title.text();
                        }
			if ($title.text() === 'Match'){ 
                        	$back.text(sessionStorage.team);
                        }
                    }
                });
            });
            
            function setTitleSelector(ts){
                titleSelector=ts;
            }
            
            return {
                setTitleSelector: setTitleSelector
            }

        });
    }
})(jQuery);