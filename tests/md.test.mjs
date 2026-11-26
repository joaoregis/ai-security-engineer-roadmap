// node tests/md.test.mjs — checa o mini-markdown das aulas (escape + blocos).
import assert from 'node:assert';
import { md } from '../src/js/utils.js';

const html = md(`### Título
Texto com **negrito**, \`código\` e *ênfase*
continua no mesmo parágrafo.

- item <script>
- item 2
1. passo
> destaque
~~~
a <b> c

d
~~~`);

assert.ok(html.includes('<h4>Título</h4>'), 'título');
assert.ok(html.includes('<p>Texto com <strong>negrito</strong>, <code>código</code> e <em>ênfase</em> continua no mesmo parágrafo.</p>'), 'parágrafo + inline');
assert.ok(html.includes('<ul><li>item &lt;script&gt;</li><li>item 2</li></ul>'), 'lista escapada');
assert.ok(html.includes('<ol><li>passo</li></ol>'), 'troca de lista fecha a anterior');
assert.ok(html.includes('lesson-callout">destaque</div>'), 'destaque');
assert.ok(html.includes('<pre class="lesson-code"><code>a &lt;b&gt; c\n\nd</code></pre>'), 'bloco preserva linhas e escapa');
assert.ok(!/<script>/.test(html), 'sem HTML cru');
console.log('md.test.mjs: OK');
