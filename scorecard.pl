
main();

#Main
sub main {

	$main="MAIN";
	$newseason="2011-2012";

	definitions();

	getclubs();

	print "\n\nCreating club / division cvs lists...";
	$summaries="/club_divisions";
        loadnew();
        clubloop();

	print "\n\nCreating club iphone web pages...";
	$team_lib=$toplivelib.$summaries;
	$topdevlib=$here.$team_lib;
	$summaries="/club_webapps";

        csvloop();

	sleep 10;
}

#loadnew
sub loadnew {
	getnewyear();
	$previous=0;
}


#clubloop
sub clubloop {
        $clubcount=0;
        print $year."\n";
        foreach $club (@clubs) {
                chomp $club;
		$club=~s/\s+$//gi;
                if ($club ne "") {
                   print "\n";
                   print ++$clubcount." ";
                   scantables($club);

                   $document=lc($summaryfilename);
                   print $club;
                   $spacer=substr("                         ",0,25-length($club));
                   print $spacer;

                   print " : csv ";

		   $document=~s/.htm/.csv/gi;
		   $document=~s/[<>]//gi;

                   updatelive();
                }
        }

}


#csvloop
sub csvloop {
        $clubcount=0;
        print $year."\n";
        foreach $club (@clubs) {
                chomp $club;
		$club=~s/\s+$//gi;
                if ($club ne "") {
                   print "\n";
                   print ++$clubcount." ";

                   $document=lc($summaryfilename);
                   print $club;
                   $spacer=substr("                         ",0,25-length($club));
                   print $spacer;

                   print " : html ";


        my($templib)="$toptemplib".$summaries;
        mkdir($templib);

        my($livelib)="$toplivelib".$summaries;
        mkdir($livelib);

        $search_text=lc($club);
        $search_text=~s/(\s)*&[amp;]*(\s)*/_/g;
        $search_text=~s/ /_/g;
	$club_filename=$search_text;

	getteams();

        chdir($templib);
        $summaryfile=">$search_text.html";
        $summaryfilename="$search_text.html";
        open($summaryhandle, $summaryfile);

        $outhandle=$summaryhandle;


		$our_club=$club;
	        
		standard("jqtHead1");
        	standard("jqtHead2");
        	standard("jqtBody1");

		teams_page();        		
		
        	standard("jqtMatch1");

	        standard("jqtPlayers1");
	        standard("jqtPlayers2");
		
        	standard("jqtScorecard1");
	        standard("jqtRubber1");
	        standard("jqtPreview");

		standard("jqtFooter1");

        	close $outhandle;


		   $document=~s/.csv/.html/gi;
		   $document=~s/[<>]//gi;

                    updatelive();
                }
        }

}


#teams page
sub teams_page {
	
	standard("jqtTeams1");
	
	@team_count=();

	for ($pass=1; $pass<=2; $pass++) {

		$team_num=0;
		
		foreach $teamline (@teams) {

			$team_num++;
	
		        @teamdetails=split ",",$teamline;
			$division=$teamdetails[0];

			@teamdetails[0]="aaa";
			@teamdetails=sort(@teamdetails);			

			if ($division =~ "Mens") {
				$div_type="Mens";
			}

			if ($division =~ "Ladies") {
				$div_type="Ladies";
			}

			if ($division =~ "Mixed") {
				$div_type="Mixed";
			}


			$division=~s|$div_type||gi;
			$division=~s|div\s|Division |gi;
			$team_count=0;

			for ($i = 1; $i <= 8 ; $i++) {
				$this_team=$teamdetails[$i];
				$this_team=~s/\s+$//gi;
				$this_club=$this_team;
				$this_club=~s|[\s]*[0-9]{0,1}(st){0,2}(nd){0,2}(rd){0,2}(th){0,2}$||gi;

				if (($this_team ne '') && ($pass<2)) {
							@team_count[$team_num]++;
				}

				if ($this_club eq $club) {
						$our_team=$this_team;
						$our_club=$club;
						$our_team=~s|($our_club\s*[0-9]*)[stndrdth]{0,2}$|$1|i;
	
						$our_team_short=$our_team;
						$our_team_short=~s|$our_club\s*([0-9]*)[stndrdth]{0,2}$|$div_type $1|i;

						$our_team_abbrev=$our_team_short;
						$our_team_abbrev=~s|([0-9])[stndrdth]{0,2}$|$1|gi;
						$our_team_abbrev=~s|Mens(\s)*|M|gi;
						$our_team_abbrev=~s|Ladies(\s)*|L|gi;
						$our_team_abbrev=~s|Mixed(\s)*|X|gi;
						if ($pass < 2) {
							standard("jqtTeams2");
						}
						if ($pass == 2) {
							fixtures_page();
						}
				}


			}
			
		}


		if ($pass == 1) {
			standard("jqtTeams3");
		}


	}		
        


}

#fixtures page
sub fixtures_page {
				
        standard("jqtFixtures1");

	$fixture_sequence=0;
	for ($i2 = 1; $i2 <= 8 ; $i2++) {
		$this_team=$teamdetails[$i2];
		$this_team=~s/\s+$//gi;
		$this_club=$this_team;
		$this_club=~s|[\s]*[0-9]{0,1}(st){0,2}(nd){0,2}(rd){0,2}(th){0,2}$||gi;

		$opp_team=$teamdetails[$i2];
		$opp_team=~s/\s+$//gi;
		$opp_club=$opp_team;
		$opp_club=~s|[\s]*[0-9]{0,1}(st){0,2}(nd){0,2}(rd){0,2}(th){0,2}$||gi;
		$opp_team=~s|($opp_club\s[0-9]*)[stndrdth]{0,2}$|$1|i;

		if (($opp_team ne $our_team) and ($opp_team ne "")) {
				
			$fixture_sequence++;
        		standard("jqtFixtures2");
			if (@team_count[$team_num]<6) {			# do another if playing both home and away			
				$fixture_sequence++;
	        		standard("jqtFixtures2");
			}		
		}		

	}
        standard("jqtFixtures3");
}


#Generic Definitions
sub definitions {
	print "Initialising...\n";

	use Cwd;
	$here=getcwd;

	$templates=$here."/Templates";
	$toptemplib=$here."/temp";
	$toplivelib=$here."/live";
	$topdevlib="C:/NottsBA";

        $clubhead="../clubs/nba_";

# get toady date
	$date = scalar localtime(time);

# strip out the time & replace with a comma
	$date=~s/\s\d+:\d+:\d+/,/;

# swap month & day number
        $date=~s/(\w+) (\d+)/$2 $1/;
}

sub updatelive	{
	$live=$toplivelib.$summaries."/".$document;
	$temp=$toptemplib.$summaries."/".$document;

if (-e $live) {
	$same = mycomparefiles( $live, $temp );
} else {
    print "New file $document being created\n";
    $same=0;
}

	if ($same ne 1)	{

			chdir($toplivelib.$summaries);
			$outfile=">".$document;
                 	open($outhandle, $outfile) or print "1.Can't find $outfile: $!\n";

			chdir($toptemplib.$summaries);
			$infile="<".$document;
			scoff($inhandle,$infile);

			close $outhandle;

			print " - updated  ";
	}	else	{
			print " - no change";
	}
}


#Copy from standard templates
sub standard {

	my(@templates)=@_;

	chdir($templates);

	foreach $template (@templates)	{
		$infile="<".$template.".txt";
		scoff($inhandle,$infile);
	}

}

#Open Outfile
sub outfile {

	my($path,$file)=@_;
	mkdir($path,0755);
	chdir($path);
	$outfile=">".$file;
	open($outhandle, $outfile) or print "2.Can't find $outfile: $!\n";

}

sub scoff	{
	my($handle,$file)=@_;
	open($handle, $file) or print "3.Can't find $file: $!\n";

        $file=lc($club).".htm";
        $file=~s/ /_/g;

        $our_summary=$club_filename;

   	$replaceheader="othersummaryhead.file";

        $replaceheader2=$clubhead.$file;

	while (<$handle>) {
		s|:PAGETITLE:|$pagetitle|gi;
		s|:TITLE:|$title|gi;
		s|<DATE>|$date|gi;
		s|<MAINFOLDER>|$main|gi;
#		s|<STYLESHEET>|$stylefilename|gi;
		s|<SEASON>|$year|gi;
		s|<SUMMARYFILE>|$replaceheader|gi;
		s|<DETAILFILE>|$replaceheader2|gi;
		s|<OURSUMMARY>|$our_summary|gi;

		s|:OUR_CLUB:|$our_club|gi;
		s|:OPP_CLUB:|$opp_club|gi;

		s|:OUR_TEAM:|$our_team_short|gi;
		s|:OPP_TEAM:|$opp_team|gi;

		s|:OUR_PAIR:|$our_pair|gi;
		s|:OPP_PAIR:|$opp_pair|gi;

		s|:OUR_TEAM_ABBREV:|$our_team_abbrev|gi;
		s|:FIX_SEQ:|$fixture_sequence|gi;

		s|:DIVISION:|$division|gi;
		s|:VENUE:|$venue|gi;
		s|:DATE:|$date|gi;
		s|:FILE:|$club_filename.html|gi;


                if ($previous==1) {
                   s|>ladies/|>prev-ladies/|gi;
		   s|>mens/|>prev-mens/|gi;
		   s|>mixed/|>prev-mixed/|gi;
                }

		print $outhandle $_;
	}
	close $handle;
}

# new season details
sub getnewyear {

	$year=$newseason;
}


sub getclubs {
        $searchfile="clubs.txt";
        open(_searchfile, "$templates/$searchfile") or print "4.Can't find $searchfile: $!\n";
        @clubs=<_searchfile>;
        close(_searchfile);
}

sub getteams {
        $searchfile=$club_filename.".csv";
        open(_searchfile, "$team_lib/$searchfile") or print "GT.Can't find $searchfile: $!\n";
        @teams=<_searchfile>;
        close(_searchfile);
}

sub scantables {

	my($searchtext)=@_;

        $pagetitle="NottsBA : ".$searchtext." : summary : ".$year;

	$title=$searchtext;
	$title=~s/_/ /gi;
	$title=~s/(.*)/\u$1/gi;

        my($templib)="$toptemplib".$summaries;
        mkdir($templib);

        my($livelib)="$toplivelib".$summaries;
        mkdir($livelib);

        $search_text=lc($searchtext);
        $search_text=~s/(\s)*&[amp;]*(\s)*/_/g;
        $search_text=~s/ /_/g;

        chdir($templib);
        $summaryfile=">$search_text.csv";
        $summaryfilename="$search_text.csv";
        open($summaryhandle, $summaryfile);

        $outhandle=$summaryhandle;


        $type="mens";
        $searchfolder="$topdevlib/$type/";      
        scandir($searchfolder,$searchtext);
        $type="mixed";
        $searchfolder="$topdevlib/$type/";      
        scandir($searchfolder,$searchtext);
        $type="ladies";
        $searchfolder="$topdevlib/$type/";      
        scandir($searchfolder,$searchtext);

        $outhandle=$summaryhandle;

        close $outhandle;

}

sub scandir {

         my($searchlib,$searchtext)=@_;

         chdir $searchlib;

         opendir(DIR,$searchlib) || die "$!";
         my(@listing)=readdir DIR;
         closedir(DIR);

         $joinedlist=join "£",@listing;
         $joinedlist=~s/_prem/_div0/gi;
         @splitlist=split "£",$joinedlist;
         @sortedlist=sort(@splitlist);
         $joinedlist=join "£",@sortedlist;
         $joinedlist=~s/_div0/_prem/gi;
         @splitlist=split "£",$joinedlist;

	 $count=0;
	 foreach $item (@splitlist)	{

                if ($item ne "." && $item ne ".." && $item ne $searchlib) {

                   $count++;
                        $_=$item;
                        if ((m/.htm/) && (! m/_all.htm/)) {
                           $document=$item;

                           readdoc($document,$searchtext);
                           if ($found) {
                              stripcontent($document,$searchtext);
                           }
                        }

                }
	 }

}

sub readdoc {

         my($searchfile,$searchtext)=@_;

        $found=0;

    open(_searchfile, "$searchfile") or print "6.Can't find $searchfile: $!\n";

    undef $/;
    $currenthtml=<_searchfile>;
    close(_searchfile);
    $/ = "\n";

    $currenthtml=~s/\n//gi;
    $currenthtml=~s/[ ]{1,}/ /gi;

        if ($currenthtml =~ />$searchtext(\<\/a\>)*[\s]*[1-8A-H]{0,1}[st]{0,2}[nd]{0,2}[rd]{0,2}[th]{0,2}(<span[^<]*<\/span>)*[\s]*<\/td>/i) {
                   $found++;
        }

}


sub stripcontent 	{

    my($searchfile,$searchtext)=@_;

    open(_searchfile, "$searchfile") or print "7.Can't find $searchfile: $!\n";
    undef $/;
    $rawdata=<_searchfile>;
    close(_searchfile);
    $/ = "\n";

    $indata=$rawdata;
    @table=striptable($indata);
    @withlinks=addextras(@table);
    print $summaryhandle @withlinks;
    
}


sub striptable 	{

    foreach $_ (@_)    {

		s|\n|~~~|gi;    # temporarily remove line breaks

		s|<!--START[^£]*£-->||gi;    #get rid of old autotext blocks

                s|.*<table|<br /><table|gi;
                s|<table[^>]*>|<table class="scoretable">|gi;
s|<tr.*Nottinghamshire[^<]*</td>|<tr>|gi;
                s|</table>.*|</table>|gi;
                s|<td[^<]*Matches Played up to date[^<]*</td>.*|</tr></table>|gi;
s|<u [^\/]*/u>||g;
		s|(<[^>]*)~~~([^>]*>)|$1 $2|gi;    # join split tags
		s|(\w{1,})\=(\w{1,})|$1="$2"|g;    # add quotes to attributes

                s|</body>||gi;
                s|</html>||gi;
                s|</div>||gi;

		s|style='HEIGHT:[0-9.]*pt'||gi;
		s|style='WIDTH:[0-9.]*pt'||gi;
		s|class="xl[0-9]*"||gi;
		s|align="[a-z]*"||gi;
		s|width="[0-9]*"||gi;
		s|height="[0-9]*"||gi;
		s|"|'|gi;
		s|style='[a-z;:\-]*'||gi;
		s|&nbsp;||gi;
		s|x:str='[^']*'||gi;

s| x:num=['"\.0-9]*||gi;
s| x:num||g;

		s|<td[\s]*>|<td>|gi;

		s|<[/]*colgroup>||gi;
		s|<[/]*col[^>]*>||gi;

		s|<td[\s]*></td>||gi;

		s|</td>[</trd>\s~]*League Table[</trd>\s~]*S T A N D I N G S</td>|</td>|gi;

		s|<a [^>]*>||gi;
		s|</a>||gi;

		s|<td>p</td>||gi;
		s|<td>w</td>||gi;
		s|<td>l</td>||gi;
		s|<td>rf</td>||gi;
		s|<td>ra</td>||gi;
		s|<td>pts</td>||gi;

		s|<td>[\s]*(-?[0-9]{1,2})[\s]*</td>|$1|gi;

		s|(\w)\s*~~~\s*(\w)|$1 $2|gi;

		s|</td>[\s~0-9\-]*</tr>|,|gi;
		
		s|<[/]*tr[\s]*>[\~\s]*||gi;
		s|</td>||gi;
		s|\_||gi;
		s|[\s]*[\~]{1,2}[\s]*||gi;
		s|<[\/]*span[\s~]*>||gi;
		s|<br /><table class='scoretable'>||gi;
		s|</table>|~~~|gi;

		s| ,|,|gi;


		s|~~~|\n|gi;
		s|\n[\s]*\n|\n|gi;

      }
      return @_;
}


sub addextras {

        @intext=@_;

    foreach $intext (@intext)    {
               $search="<td>";
               $replace="";
               $intext=~s/$search/$replace/gi;
    }

return @intext;
}



sub replacechomp 	{

    my($searchtext)=@_;

	$text1 = ' <a href="./';
	$text2 = $replacetype.".php";
	$text3 = '';
	$text4 = $prefix;
	$text5 = lc($searchtext);
	$text5 =~ s/(\s)*&[amp;]*(\s)*/_/g;
	$text5 =~ s/\s/_/g;
	$text6 = '">';
	$text7 = $searchtext;
	$text8 = '</a>';
    $replacetext=$text1.$text2.$text3.$text4.$text5.$text6.$text7.$text8;

    foreach $intext (@intext)    {

            $alttext=$intext;

            $found=1;
            while ($found == 1) {

            $found=0;
            if ($alttext =~ m|<td>([\s]*)$searchtext([\s]*[1-8A-H]{0,1}[st]{0,2}[nd]{0,2}[rd]{0,2}[th]{0,2}(<span[^<]*</span>)*[\s]*)</td>|i) {

               $search="<td>".$1.$searchtext.$2."</td>";
				if ($club eq $searchtext) {
					$replacetext="<strong>$searchtext</strong>";
					$classext="_highlight";
				} else {
					$classext="";
				}
               $replace="<td class='".$class.$classext."'>".$replacetext.$2."</td>";


               $alttext=~s/$search/$replace/gi;
               $found=1;

            }

            if ($searchtext =~ m|Div([0-9A-C]{1,2})|) {
               $search=$searchtext;
               $search=~s/($1)/ision $1/;
               $replace=$replacetext;
               $replace=~s/>$searchtext</>$search</;
               $search="<td>".$search."</td>";
               $replace="<td class='$class'>".$replace."</td>";
               $alttext=~s/$search/$replace/gi;
            }


            if ($searchtext =~ m|(\w*) Div([0-9A-C]{1,2})|) {
               $search=$1." ".$2;
               $replace=$replacetext;
               $replace=~s/>$searchtext</>$search</;
               $search="<td>".$search."</td>";
               $replace="<td class='$class'>".$replace."</td>";
               $alttext=~s/$search/$replace/gi;
            }

            if ($searchtext =~ m|(\w*) Div([0-9A-C]{1,2})|) {
               $search=$1." Div ".$2;
               $replace=$replacetext;
               $replace=~s/>$searchtext</>$search</;
               $search="<td>".$search."</td>";
               $replace="<td class='$class'>".$replace."</td>";
               $alttext=~s/$search/$replace/gi;
            }

            if ($searchtext =~ m|(\w*) Div([0-9A-C]{1,2})|) {
               $search=$1." Division ".$2;
               $replace=$replacetext;
               $replace=~s/>$searchtext</>$search</;
               $search="<td>".$search."</td>";
               $replace="<td class='$class'>".$replace."</td>";
               $alttext=~s/$search/$replace/gi;
            }

            if ($searchtext =~ m|(\w*) Prem|) {
               $search=$1." Premier";
               $replace=$replacetext;
               $replace=~s/>$searchtext</>$search</;
               $search="<td>".$search."</td>";
               $replace="<td class='$class'>".$replace."</td>";
               $alttext=~s/$search/$replace/gi;
            }


            if ($searchtext =~ m|(\w*) Prem|) {
               $search="Premier ".$1;
               $replace=$replacetext;
               $replace=~s/>$searchtext</>$search</;
               $search="<td>".$search."</td>";
               $replace="<td class='$class'>".$replace."</td>";
               $alttext=~s/$search/$replace/gi;
            }

            if ($searchtext =~ m|(\w*) Div1|) {
               $search=$1." Division One";
               $replace=$replacetext;
               $replace=~s/>$searchtext</>$search</;
               $search="<td>".$search."</td>";
               $replace="<td class='$class'>".$replace."</td>";
               $alttext=~s/$search/$replace/gi;
            }

            }


            if ($alttext ne $intext) {
               $intext=$alttext;
            }

    }

}

sub highlightchomp 	{

    my($searchtext)=@_;

    $text1=' <b>';
    $text2=$searchtext;
    $text3='</b> ';
    $replacetext=$text1.$text2.$text3;

    foreach $intext (@intext)    {

            $alttext=$intext;

            $found=1;
            while ($found == 1) {

            $found=0;
            if ($alttext =~ m|>$searchtext([\s]*[1-8A-H]{0,1}[st]{0,2}[nd]{0,2}[rd]{0,2}[th]{0,2}(<span[^<]*</span>)*[\s]*)</td>|i) {

               $search=">".$searchtext.$1."</td>";
               $replace=">".$replacetext.$1."</td>";
               $alttext=~s/$search/$replace/gi;
               $found=1;
            }


            }

            if ($alttext ne $intext) {
               $intext=$alttext;
            }

    }

}


sub mycomparefiles {

        my($file1,$file2)=@_;
	open($handle1, $file1);
	open($handle2, $file2);
	undef $/;
	$test1=<$handle1>;
	$test2=<$handle2>;

# strip out the dates as these always change
        $test1=~s|Last updated:.*\n||;
        $test2=~s|Last updated:.*\n||;
        close $handle1;
        close $handle2;
        $/ = "\n";

        if ($test1 eq $test2)     {
           return 1;
        }

        return 0;
}