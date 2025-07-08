/* eslint-disable no-magic-numbers */
import { parse, Lang, type Edit } from '@ast-grep/napi';

// Rule for rewriting ESM imports/exports
// Use playground to test and modify the rule:
// https://ast-grep.github.io/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImphdmFzY3JpcHQiLCJxdWVyeSI6ImltcG9ydCAkWCBmcm9tICRTUkMiLCJyZXdyaXRlIjoiaW1wb3J0ICRYIGZyb20gJFNSQyIsInN0cmljdG5lc3MiOiJzbWFydCIsInNlbGVjdG9yIjoiIiwiY29uZmlnIjoiIyBZQU1MIFJ1bGUgaXMgbW9yZSBwb3dlcmZ1bCFcbiMgaHR0cHM6Ly9hc3QtZ3JlcC5naXRodWIuaW8vZ3VpZGUvcnVsZS1jb25maWcuaHRtbCNydWxlXG5ydWxlOlxuICBraW5kOiBzdHJpbmdfZnJhZ21lbnRcbiAgcmVnZXg6IF5cXC9cbiAgcGF0dGVybjogXG4gICAgY29udGV4dDogJEFcbiAgaW5zaWRlOlxuICAgIGtpbmQ6IHN0cmluZ1xuICAgIG50aENoaWxkOlxuICAgICAgcG9zaXRpb246IDFcbiAgICAgIHJldmVyc2U6IHRydWVcbiAgICBpbnNpZGU6XG4gICAgICBhbnk6XG4gICAgICAgIC0ga2luZDogZXhwb3J0X3N0YXRlbWVudFxuICAgICAgICAtIGtpbmQ6IGltcG9ydF9zdGF0ZW1lbnRcbiAgICAgICAgLSBraW5kOiBhcmd1bWVudHNcbiAgICAgICAgICBpbnNpZGU6XG4gICAgICAgICAgICBraW5kOiBjYWxsX2V4cHJlc3Npb25cbiAgICAgICAgICAgIHBhdHRlcm46IGltcG9ydCgkJCQpXG5maXg6XG4gIC9lc20kQVxuIiwic291cmNlIjoiLyogZXNtLnNoIC0gcmVhY3RAMTkuMS4wICovXG5leHBvcnQgKiBmcm9tIFwiL3JlYWN0QDE5LjEuMC9lczIwMjIvcmVhY3QubWpzXCI7XG5leHBvcnQgeyBkZWZhdWx0IH0gZnJvbSBcIi9yZWFjdEAxOS4xLjAvZXMyMDIyL3JlYWN0Lm1qc1wiO1xuaW1wb3J0ICogYXMgZm9vIGZyb20gXCIvcmVhY3RAMTkuMS4wL2VzMjAyMi9yZWFjdC5tanNcIjtcbmltcG9ydCAnL3Rlc3QnXG5cbmltcG9ydCgnL2Zvby8nKVxudGVzdCgnL2Zvby8nKVxuIn0=
const ruleConfig = {
  rule: {
    kind: 'string_fragment',
    regex: '^\\/',
    pattern: {
      context: '$A'
    },
    inside: {
      kind: 'string',
      nthChild: {
        position: 1,
        reverse: true
      },
      inside: {
        any: [
          {
            kind: 'export_statement'
          },
          {
            kind: 'import_statement'
          },
          {
            kind: 'arguments',
            inside: {
              kind: 'call_expression',
              pattern: 'import($$$)'
            }
          }
        ]
      }
    }
  },
  fix: '/esm$A'
};

export const handleEsm = async (req, res) => {
  try {
    const targetPath = req.url.replace(/^\/esm/u, '');
    const upstreamUrl = `http://esm:8080${targetPath}`;

    const upstreamRes = await fetch(upstreamUrl);
    if (!upstreamRes.ok) {
      res.writeHead(upstreamRes.status);
      return res.end(await upstreamRes.text());
    }
    const sourceJS = await upstreamRes.text();

    const root = parse(Lang.JavaScript, sourceJS).root();
    const edits: Edit[] = [];

    for (const match of root.findAll(ruleConfig)) {
      const text = match.getMatch('A')?.text();
      text && edits.push(match.replace(ruleConfig.fix.replace('$A', text)));
    }

    const outJS = root.commitEdits(edits);
    res.setHeader('Content-Type', 'application/javascript');
    return res.end(outJS);
  } catch (err) {
    console.error('ESM proxy error:', err);
    res.writeHead(500);
    return res.end(err.stack);
  }
};
