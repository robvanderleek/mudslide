# Calc to Whatsapp Utility				
## What it does
It is a template which can create personalised whatsapp message strings and send those messages automatically to selected recipients

## Where it can be used		
You can connect this template to any other data sheets and create the formula to generate and populate appropriate fields in the utility	

Using it you can send customised messages to your entire friend’s list	

Using it you can send customised messages to your customers	

Using it you can send customised messages to share Invoice details	

Using it you can send customised messages to give regular reminders to set of people	

Possibilities any many …	

If you can create and understand formulas in Spreadsheet, you can use the utility and automate task of sharing messages with the relevant people.

## How it does		
It uses project mudslide & WhiskeySockets/Baileys and connects bash scripts to send whatsapp messages	

Libreoffice calc prepares and executes bash scripts for customised messages	

### Further info for NERDS ...
Contact wise scripts are prepared In the sheet "Send_Whatsapp_Message" Col AA to AP

The generated individual scripts are merged together and fed to Linux terminal BASH script

Details of scripts are present in hidden sheet " Mudslide_Commands "

Different Macros are used for different activities

Macros fetch relevant scripts from sections of  " Mudslide_Commands "

Macros will open terminal window and execute scrip commands

You can modify / manipulate anything once you observe the process and commands mentioned in  " Mudslide_Commands "

## What does it require

Ubuntu 22.04 / Linux Mint 21	

Libreoffice calc [ macros enabled ] Tools → Options → Security → Macro Security → Set to “Medium” or “Low" as per your case	

### Other detailed information is mentioned in How_To_Use sheet of [Libreoffice_Calc_To_Whatsapp.ods](https://github.com/pharmankur/mudslide/raw/main/Calc_To_Whatsapp_Utility/Linux/Libreoffice_Calc_To_Whatsapp.ods)




