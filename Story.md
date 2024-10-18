GitSwitch
It's been months since I have built something. This is weird, I am better at programming now than before, but I was building more stuff before back then, maybe I am trying to punch above my weight, who knows.
In the last two projects I gave up, the physics engine was going good, but then all the vector math overwhelmed me, there it was less about code and more about match and obscure algorithms. I think I was building that to impress people, is it wrong, I don't think so.
I am getting too impatient and anxious to get the recognition, I don't know, I want to build something that is good. All the softwares I have built are very hacky kind of project, which angers me a bit.
Its entropy that's getting me, I know it. Every software project that I start, I get this thought "who will use my garbage, I need to make something big and impressive", At the start you have all these crazy ideas, as the time goes by the ideas seem idiotic, and you just get lost in the thought of building stuff and never actually building, will it get me who knows, entropy is a curse, run away from it as fast as you can, once it gets you, everything will be cringe to you, anything you do is substandard, garbage.
It's rainy today. I want to push a fix to the open source library that I use on my second laptop, but it uses a git account that is not meant for regular work. My personal laptop was at home and in that laptop was my personal git setup.
So how do I do it now, am searching how to add two accounts on git on google and there is no simple way I am finding, some random articles who give random commands, I have fucked up my git with running all these weird commands great now I need to uninstall all the stuff and re-install, thanks "random article guys"
It's unbelievable that git does not has some "add-account" or "switch-account" cli flag, why do i have to read some random article to do basic stuff, I think I get why people get angry at "I compile my own arch" people, I have important stuff to do and here I am reading some garbage by some idiot on internet cause the git guys forgot to give simple "add account" button
Either I can read this garbage or solve this on my own, how complex could this be.
When I said I wanted to build some software, I did now mean this low hanging Git account manager type stuff, but whatever, I want this problem to just go away.
Now that I think of it, even adding git on windows was a nightmare, I just followed some tutorial and set it up somehow, I don't think I even remember what I needed to do.
So Its been 1 hour and I saw some tutorials and some read the official github guide to setup git
3 steps to setup git account:
1 : you need to setup your credentials in your system globally using these commands:
Set a Git username:
Copygit config --global user.name "Mona Lisa"
Confirm that you have set the Git username correctly:
Copy$ git config --global user.name
> Mona Lisa
Set an email address :
Copygit config --global user.email "YOUR_EMAIL"
Confirm that you have set the email address correctly in Git:
Copy$ git config --global user.email
> email@example.com
So I need to to setup these, but it says this thing does not connect my computer to the github website/ web server, like yes when I will go git clone or push, it will send request to github and search for account with these credentials which github will will likely find and confirm my local git yes dude I have this guy's account, but it wont let me push code, cause anyone can know my username and email, that does not mean they can now just setup my git in their computer and push random code to my github, they are not that stupid
So that thing that verifies that my computer which is sending the request is the computer that is authorized to send request and the github account whose credentials I have set on my computer belongs to me, I need to generate a ssh key using some algorithm they say and this will generate two file a public and private key, I need to read the public key, copy its text, paste it in my github ssh key section, then there is a command to verify the connected and there you have it, your git it setup now.
Generate ssh key command:
Copyssh-keygen -t ed25519 -C "your_email@example.com"
Verify connection :
Copyssh -T git@github.com
On running verify command if it gives:
Copy> Hi USERNAME! You've successfully authenticated, but GitHub does not
> provide shell access.
That means your git is connected to your github account and now you can start using it.
Ok this was not that complex, but to boring to read 😣
But I have fucked up my git setting with running all those weird commands, so I need to clear those, lets do this tomorrow, I am tired now.
DAY-2
IT rained the whole night yesterday, I am in a good mood, while it was raining at night, I found how to clear the whole git stuff.
I need to first unset those global git credentials(username, email) that I set up, then remove the ssh keys, these are found in the ssh folder in the home directory of your os.
I have cleared all the garbage, now I have a clean slate.
So what Language do I code it in, I want to make a cli app first then its GUI version, GUI cause this will mostly be used by newbies who don't open configs like the linux guys, they want something that gets their stuff done and not do all this work around,
I either go with Node.js which I know very well, or python if I don't want to use any third party library, I think I will choose Node.js.
Features :

Add user -> This will Add users
Switch Users -> Switch B/w Accounts
Delete All Users -> This option will delete all the users and their ssh keys
Delete a user -> This will delete a particular user
Show SSh keys -> This is so that if you want to see ssh keys of any active account or any account we have and its keys

Architecture : For now what I think would work is, when users chooses enter user option from cli, we prompt user to input the user.name ,user.email and then for those we run these:
Copy$ git config --global user.name
$ git config --global user.email
Then we run this :
Copyssh-keygen -t ed25519 -C "your_email@example.com"
and put the email that user game in this, this this will set the credentials and generate the ssh file for that
Ok so I coded the app user coded, and it did set the credentials and generated the ssh key paris, one public key and a private key by the names of id_ed25519 and id_ed25519.pub
But when I added a second user with a different email and username, then it unset previous accounts credentials from the global and set this new credentials and generated the new ssh for this new user.
Problems In this basic approach is, I lost the previous account that I first added credentials,I don't want the users to keep on adding same accounts, if they have given me a credentials, I need to store it in a ledger, I need a ledger(table) where I store the entered credentials and what ssh file belongs to it, where is it situated, and lastly is the account a active account ,i.e its being set in global or is it a passive account ,i..e not being set in global and just lying in the ledger as of now.
Second issue was, where I generated the ssh key for the second account I added, It generated the key with same name as previous : id_ed25519 and id_ed25519.pub, so the new key replace the previous one, I should have saw this common, but I thought if I enter a different email this will generate like a different named keys, but no the email is just for internal data not the file name.
So what do I do now:
Thoughts -> It's not that simple as I thought it would be, Now that I think of, I have never wrote anything for Desktop, mostly software that ran on a web browser, Manipulating Desktop file system is quite challenging actually, Like the .ssh folder that I am generating the files in on windows is in C/Users/user_name then there is a .ssh folder there and in that we generated these files
But on linux and mac where they would be, I want my software to be platform agnostic, I need to look into this.
Solution : Ok so what I will do is when user adds a user by entering its credentials, we generate the ssh key and rename it with "ssh_key_user.name_user.email_date" I think will generate unique keys, as for the ledger stuff to store the credentials so that they don't get lost, I guess I can store a Ledger.json file and store the credentials that user enters and the location of the ssh keys there, then nothing will be lost and there will be no conflict in ssh keys.
So I coded the solution, the ledger stuff json is working fine but those ssh keys that are generated, when I paste the public keys content on my github and test the ssh connection via :
Copy$ ssh -T GITHUB-USERNAME@github.com
> Permission denied (publickey).
It fails at this for some reason, it used to pass when I did not rename it in previous approach, why is that, I searched a lot on internet could not find why is that, I mean there must be a way to generate different name ssh keys than whatever default we have, why is all this simple things not clearly written somewhere weird.
It's been 4 hours since I have been searching for a solution to this, I tried not changing whole name of default files just put the email of user at the end but still it does not work, any change in its default name and the ssh key connection test fails, maybe git internally searches for those default named files.
But When I generate a ssh key, there is a step where it says:
[Fig 1]
See on the yellow box, it says enter file in which you want to save the key, I enter some name of file, it generates also but then I run the the test connection command and it fails:
Copy$ ssh -T GITHUB-USERNAME@github.com
> Permission denied (publickey).
Someone wrote a article saying I need to use old RSA algorithm not id_ed25519 algo and there a flag that lets you, I tried that, it did generate a RSA algo based ssh key with the file names that I wanted, but they to failed the test ssh connection.
Then Someone wrote I need to add these newly renamed ssh keys (if I am renaming then )in some ssh manager thing that is there by default, by running these commands:
Copy$ eval "$(ssh-agent -s)"
$ ssh-add ~/.ssh/file_name.pub
I did this to, and this fucking command also does not pass the test ssh connection, wtf is this garbage.
I am seeing the need for my software more and more now, at least for those who are on windows because those two above commands don't run on windows terminal or cmd, it only runs on git bash software, there are some bash commands some linux basement dweller told me.
Day -3
Japan is nice, I would like to work there some day, they have good biotech research facilities, someday maybe.
Chinese are also good at biotech, they seem to be overtaking the Japanese, atleast at software side, the new protein AI models on github. I see a lot of Chinese names, hard working people.
people laughed at them in the last decade for forging data and not producing original work.
But now they have their own talent in manufacturing to academia, the code is in public, no one can deny their wins
I see people on twitter still saying they can't produce original work, but these are range bate accounts, anyone who work in industries can tell, the tide is on their side, they have research, manufacturing, scale and talent
Bytedance, Tencent has a homegrown talent network that is on par with what you have in the west.
As for the west, US to me still 10x ahead of every single country, berkeley, yale, Carnegi mellon, MIT's are still the best place for anyone to goto, the faculty there is insanely talented, they have money, labs, industrial support everything.
The issue with west is, the top talent from MIT, Waterloo, harward is not the one who is going into biotech, material science, nuclear ,building AI models for protein structure, small scale nuclear reactors, the top talent is working at Jane street, Hudson river trading, these HFT and write low latency c++ code so they could buy stocks at bulk before everyone and sell it for tiny margins and make moni, so the world best brains and not working on important stuff but on paper moni transactions, great future ahead.
The free market enthusiast dies inside me everytime I see this. Best brains are working at HFT's making "Day in a life of " videos, some guys do stupid stuff, the internet laughs at them, all the startups give them money to promote their product to this internet attention seeking clown, they call it influencer marketing.
People who profit on artificially created insecurities earn more than anyone who works on any actual important stuff that matters, And the free market justifies this.
The free market values tik tok dancers, makeup gurus, drop shippers, supplement sellers, podcast bros more than any person who is working on virology, protein, electronics or even other core fields like electronics.
Entertainment is the new drug, the free market values this drug more than any drug that could save their lives.
I am no socialist, but If you notice
The internet, space program, telecommunication, all of these could only be produced by the government from tax money, had this been given to free market junkies, they would have bought their stocks every quarter or invested in real estate more than ever to develop anything, look at boeing.
Free market junkies are traders and speculators, their religion is money not in solving complex problems.
But there is SpaceX, Google, Lockheed Martin, ASML, these are free market companies, and they have very impressive tech, so I can't deny that free market companies are not building things actually once the base foundation has been laid out by government, the free market picks up and accelerates tech, but the founders of these were not these "free market money speculators/traders " these were enginners by heart, people like elon, sergey brin, the team at skunkworks, but no one likes the scumbags who play the game of speculations at wall street.
I think it's more about people than the economic model. Some people's motivation is money so they will create tech if there is monetary incentive which I don't think is bad, but on things that the free market does not consider important, you need the government to fund those areas.
It's all about people, you don't want money, a speculator as your company head, you don't want a vision less corrupt guy as your country head, both of them want to hoard all the resources for themselves.
Ok too much rant, let's get back to code:
So where was I, yeh the ssh files generated, if you modify their names, then the ssh connection test fails. The guys writing articles say you can, but I tried and it failed.
You know what, when you can't shoot the enemy with a glock, its time to bring a javelin rocket launcher.
I will use my hammer even if its nail or not.
Approach 2:
What I will do is, when user enters their username and email, we generate the ssh key in the ~ssh directory but we don't change the name, we store whatever user typed in a json file called ledger.json, so we store credentials and where that credentials ssh file is, currently it would be in ~ssh folder.
Now when user decides to add second user to our gitswitch app ,they again enter user.name and email, but before we generate the new ssh key pair cause that could replace the previous once, we move the previous once to a different folder which we will call "Git Store" so its a store that stores all your ssh files that are currently not of active account.
In the gitstore folder we will make a folder by the name of inactive account whose ssh we are moving here, name is after it user_name_email and move the ssh files in this folder.
Once the inactive(previous) accounts ssh keys are moved there, we move on to create the new ssh keys for the second accounts who the user just entered and set its credentials in global this will fix the clashing of ssh keys issue
Also I can store the status of credentials, like if the credentials are set globally and its ssh kyes are in ~ssh folder then its a active account, rest are inactive
So that we can have a command to switch b/w accounts, and you select a inactive account, it will unset the previous active accounts credentials, move its ssh keys from ~ssh folder to the key store folder and then we set this new switched accounts credentials as global and move its ssh keys from key store folder to ~ssh folder, this switching the accounts.
Let's get to code...
Ok its been 2 hours since I coded this, it works but its all messed up, the code works for windows but when I ran that on linux I am facing a lot of issues, the file structure of linux or any unix based O.S is very different than that of windows, will I have to write different code for different operating systems, that would be so boring...
My requirements are:

Store credentials
Execute shell commands to set or unset credentials and generate ssh keys
store those ssh keys in proper places(folders)
move ssh keys around from key store folder to ~ssh folder based on status of credentials.

And this should work for all operating systems, and I don't want to write different code for different operating systems.
What to do, I can
