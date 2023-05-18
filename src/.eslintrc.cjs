module.exports = {
    overrides: [
        {
            files: ['**/*.ts', '**/*.tsx'],
            extends: ['plugin:@typescript-eslint/eslint-recommended', 'plugin:@typescript-eslint/recommended'],
            parser: '@typescript-eslint/parser',
            plugins: ['@typescript-eslint'],
            env: {
                node: false,
                browser: true,
            },
        },
    ],
}
