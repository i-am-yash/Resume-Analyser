    const express = require('express');
    const cors = require('cors');
    const compression = require('compression');
    const app = express();
    app.use(compression());
    app.use(cors());
    app.use(
    express.json({
        limit: '10mb',
        type(req) {
        const ct = (req.headers['content-type'] || '').toLowerCase();
        if (/multipart\/form-data/i.test(ct)) return false;
        const trimmed = ct.trim();
        return trimmed === '' || /json|\bgraphql\b/i.test(trimmed);
        },
    })
    );
    app.use(
    express.urlencoded({
        extended: true,
        limit: '10mb',
        type: (req) =>
        /\bapplication\/x-www-form-urlencoded\b/i.test(
            req.headers['content-type'] || ''
        ),
    })
    );

    app.get('/health', (req, res) => {
    res.send('Server is running');
    });
    const resumeRoutes = require('./routes/resumeRoutes');
    app.use('/api/resume', resumeRoutes);
    const matchRoutes = require('./routes/matchRoutes');
    app.use('/api/match', matchRoutes);

    // Turn body-parser JSON errors into our envelope + explain multi-line pastes
    app.use((err, req, res, next) => {
    const isParseFailed = err?.type === 'entity.parse.failed';
    const msg = typeof err?.message === 'string' ? err.message : '';
    const status = err.status || err.statusCode;
    const msgSuggestsJsonBroken =
        /bad control character|unexpected token|\\n|String literal|StringLiteral|^Expected property name|expected ',' or '} at position|^'"'|'\\|'\\' is not valid|JSON at position|^invalid json/i.test(
        msg
        );
    const looksLikeBrokenJsonBody =
        isParseFailed || (status === 400 && msgSuggestsJsonBroken);

    if (
        req.originalUrl.startsWith('/api') &&
        looksLikeBrokenJsonBody &&
        !res.headersSent
    ) {
        return res.status(400).json({
        status: '400',
        message:
            'Invalid JSON body. Paste each field as ONE JSON string — raw line breaks inside a string break JSON. Use \\n instead of pressing Enter inside the quotes, escape any " as \\", or in Postman set Body → raw → JSON and put the blob in quoted strings correctly. Easiest: in browser console run JSON.stringify(myText), copy the result including quotes.',
        data: null,
        });
    }
    next(err);
    });

    module.exports = app;