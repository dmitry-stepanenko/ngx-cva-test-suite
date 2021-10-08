module.exports = {
    types: [
        {
            value: 'feat',
            name: 'feat:       new feature for the user, not a new feature for build script',
        },
        {
            value: 'fix',
            name: 'fix:        bug fix for the user, not a fix to a build script',
        },
        { value: 'docs', name: 'docs:       Documentation only changes' },
        {
            value: 'style',
            name: 'style:      formatting, missing semi colons, etc; no production code change',
        },
        {
            value: 'refactor',
            name: 'refactor:   refactoring production code, eg. renaming a variable',
        },
        {
            value: 'test',
            name: 'test        adding missing tests, refactoring tests; no production code change',
        },
        {
            value: 'chore',
            name: "chore:      Other changes that don't modify src or test files",
        },
        {
            value: 'build',
            name: 'build:      Changes that affect the build system or external dependencies',
        },
        {
            value: 'ci',
            name: 'ci:         Changes to our CI configuration files and scripts',
        },
        { value: 'perf', name: 'perf:       Performance related changes' },
        { value: 'revert', name: 'revert:     Revert to a commit' },
    ],

    allowTicketNumber: true,
    isTicketNumberRequired: false,
    ticketNumberPrefix: 'TICKET-',
    ticketNumberRegExp: '\\d{1,5}',

    // override the messages, defaults are as follows
    messages: {
        type: "Select the type of change that you're committing:",
        scope: '\nDenote the SCOPE of this change (optional):',
        // used if allowCustomScopes is true
        customScope: 'Denote the SCOPE of this change:',
        subject: 'Write a SHORT, IMPERATIVE (lowercase) description of the change:\n',
        body: 'Provide a LONGER description of the change (optional). Use "|" to break new line:\n',
        breaking: 'List any BREAKING CHANGES (optional):\n',
        footer: 'List any ISSUES CLOSED by this change (optional). E.g.: #31, #34:\n',
        confirmCommit: 'Are you sure you want to proceed with the commit above?',
    },

    allowCustomScopes: true,
    allowBreakingChanges: ['feat', 'fix'],
    // skip any questions you want
    skipQuestions: ['ticketNumber'],

    // limit subject length
    subjectLimit: 120,
    // breaklineChar: '|', // It is supported for fields body and footer.
    // footerPrefix : 'ISSUES CLOSED:'
    // askForBreakingChangeFirst : true, // default is false
};
