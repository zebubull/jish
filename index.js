const fs = require('fs');
const path = require('path');
const prompt = require('prompt-sync')({sigint:false});

console.clear();

let ctrlc = false;

const exit = (code) => {
    console.clear();
    process.exit(code);
}

const getPathFromCommand = (cmd) => {
    return path.join(process.cwd(), cmd.slice(1).join());
}

const leftPad = (string, length) => {
    while(string.length < length)
        string = ' ' + string;
    return string;
}

while (true)
{
    const input = prompt(`${process.cwd()}><> `);
    if (input) ctrlc = false;
    let cmd = [null];
    if (input) cmd = input.split(' ');

    switch (cmd[0])
    {
        case 'exit':
            exit(0);
            break;

        case 'ls':
            let directory = process.cwd();
            if (cmd.length > 1) directory = getPathFromCommand(cmd);

            const contents = fs.readdirSync(directory);
            const l = contents.length;
            const stats = contents.map((file, _) => {
                return fs.lstatSync(file);
            });

            let biggest = 0;
            let longest = 0;

            for (let i = 0; i < l; i++)
            {
                if (stats[i].size > biggest) biggest = stats[i].size;
                if (contents[i].toString().length > longest) longest = contents[i].toString().length;
            }

            biggest = biggest.toString().length;

            process.stdout.write(` Type  ${leftPad('Size', biggest)} ${leftPad('Name', longest)}\n\n`);

            for (let i = 0; i < l; i++)
            {
                if (stats[i].isFile())
                    process.stdout.write(`[FILE] `);
                else
                    process.stdout.write(`[DIR]  `);

                process.stdout.write(leftPad(stats[i].size.toString(), biggest));
                process.stdout.write(` ${leftPad(contents[i], longest)}\n`);
            }
            break;

        case 'cd':
            const p = getPathFromCommand(cmd);
            if (!fs.existsSync(p))
            {
                console.log('Folder does not exist...');
            }
            else if (fs.lstatSync(p).isFile())
            {
                console.log('Cannot set current directory to a file...');
            }
            else
            {
                process.chdir(p);
            }
            break;
        
        case null:
            if (ctrlc) 
                exit(0);
            ctrlc = true;
            console.log('Press CTRL+C again to exit...\n');
            break;

        default:
            console.log(`'${cmd[0]}' was not recognized as an operable command or executable file...\n`);
            break;
    }
}
