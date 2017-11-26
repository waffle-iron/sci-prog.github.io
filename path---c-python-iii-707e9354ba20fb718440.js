webpackJsonp([28935089329581],{478:function(n,a){n.exports={data:{site:{siteMetadata:{title:"Scientific Programming Blog",author:"Oscar Arbelaez"}},markdownRemark:{id:"/home/travis/build/sci-prog/sci-prog.github.io/src/pages/c-python-iii/index.md absPath of file >>> MarkdownRemark",html:'<p>Vamos a discutir ahora una forma completamente pythonica de comunicar C y Python y hacer que el resultado final sea completamente orientado a objetos.</p>\n<p>En la <a href="/c-python-ii/">anterior entrega de esta serie</a> discutimos cómo concetar Python y C a través de <a href="https://docs.python.org/2/library/ctypes.html">ctypes</a> para acelerar código de Python<sup id="fnref-1"><a href="#fn-1" class="footnote-ref">1</a></sup>.\nEl objetivo principal era no sólo poder ejecutar código de C, sino tambíen poder hacerlo de forma <em>transparente</em> para el usuario final.\nDe esta forma podíamos llamar código en C de modo que el usuario de la librería nunca sabría si está realmente ejecutando código de C.\nTanto pasando los argumentos por valor o por referencia logramos la trasnparencia de <em>funciones</em> de C.\nSabemos, sin embargo, que a pesar de que Python es multiparadigma, su uso está muy orientado a la Progamación de Objetos.\n¿No sería provechoso si pudiéramos emular el comportamiento orientado a objetos con ctypes?</p>\n<h2>Estructuras</h2>\n<p>Entre los muchos tipos que ctypes expone a Python está la estructura <code>struct</code>.\nSupongamos entonces qeue tenemos una estructura llamada <code>Rectangle</code> en C y una función que toma dicha estructura como argumento de la siguienta manera:</p>\n<div class="gatsby-highlight">\n      <pre class="language-c"><code><span class="token comment" spellcheck="true">/* file: rectangle.c */</span>\n\n<span class="token keyword">struct</span> _rect <span class="token punctuation">{</span>\n  <span class="token keyword">float</span> height<span class="token punctuation">,</span> width<span class="token punctuation">;</span>\n<span class="token punctuation">}</span><span class="token punctuation">;</span>\n\n<span class="token keyword">typedef</span> <span class="token keyword">struct</span> _rect Rectangle<span class="token punctuation">;</span>\n\n<span class="token keyword">float</span> <span class="token function">area</span><span class="token punctuation">(</span>Rectangle rect<span class="token punctuation">)</span> <span class="token punctuation">{</span>\n  <span class="token keyword">return</span> rect<span class="token punctuation">.</span>height <span class="token operator">*</span> rect<span class="token punctuation">.</span>width<span class="token punctuation">;</span>\n<span class="token punctuation">}</span>\n</code></pre>\n      </div>\n<p>La compilamos como una librería dinámica</p>\n<div class="gatsby-highlight">\n      <pre class="language-none"><code>$ gcc -c -fPIC rectangle.c\n$ gcc -shared rectangle.o -o libgeometry.so</code></pre>\n      </div>\n<p>Una estructura de C en Python es un objeto que hereda de <code>Structure</code> en ctypes, y las variables de la estructura (en este caso <code>height</code> y <code>width</code>) son llamados <code>_fields_</code> en la estructura de ctypes.\nAsí, una librería mínima de Python podría ser</p>\n<div class="gatsby-highlight">\n      <pre class="language-python"><code><span class="token comment" spellcheck="true"># file: geometry_minimal.py</span>\n\n<span class="token keyword">import</span> ctypes <span class="token keyword">as</span> C\n\nCLIB <span class="token operator">=</span> C<span class="token punctuation">.</span>CDLL<span class="token punctuation">(</span><span class="token string">\'./libgeometry.so\'</span><span class="token punctuation">)</span>\nCLIB<span class="token punctuation">.</span>area<span class="token punctuation">.</span>argtypes <span class="token operator">=</span> <span class="token punctuation">[</span>C<span class="token punctuation">.</span>Structure<span class="token punctuation">]</span>\nCLIB<span class="token punctuation">.</span>area<span class="token punctuation">.</span>restype <span class="token operator">=</span> C<span class="token punctuation">.</span>c_float\n\n<span class="token keyword">class</span> <span class="token class-name">Rectangle</span><span class="token punctuation">(</span>C<span class="token punctuation">.</span>Structure<span class="token punctuation">)</span><span class="token punctuation">:</span>\n  _fields_ <span class="token operator">=</span> <span class="token punctuation">[</span><span class="token punctuation">(</span><span class="token string">"height"</span><span class="token punctuation">,</span> C<span class="token punctuation">.</span>c_float<span class="token punctuation">)</span><span class="token punctuation">,</span>\n              <span class="token punctuation">(</span><span class="token string">"width"</span><span class="token punctuation">,</span> C<span class="token punctuation">.</span>c_float<span class="token punctuation">)</span><span class="token punctuation">]</span>\n\n<span class="token keyword">def</span> <span class="token function">area</span><span class="token punctuation">(</span>rect<span class="token punctuation">)</span><span class="token punctuation">:</span>\n  <span class="token keyword">return</span> CLIB<span class="token punctuation">.</span>area<span class="token punctuation">(</span>rect<span class="token punctuation">)</span>\n``\ndonde encapsulamos la función `area` de la librería de C<span class="token punctuation">[</span><span class="token operator">^</span><span class="token number">2</span><span class="token punctuation">]</span><span class="token punctuation">.</span>\n\nPodemos usar esta librería de forma completamente transparente desde python<span class="token punctuation">:</span>\n```python\n<span class="token operator">>></span><span class="token operator">></span> <span class="token keyword">import</span> geometry_minimal\n<span class="token operator">>></span><span class="token operator">></span> r <span class="token operator">=</span> geometry_minimal<span class="token punctuation">.</span>Rectangle<span class="token punctuation">(</span><span class="token punctuation">)</span>\n<span class="token operator">>></span><span class="token operator">></span> r<span class="token punctuation">.</span>width <span class="token operator">=</span> <span class="token number">10</span>\n<span class="token operator">>></span><span class="token operator">></span> r<span class="token punctuation">.</span>height <span class="token operator">=</span> <span class="token number">30</span>\n<span class="token operator">>></span><span class="token operator">></span> geometry_minimal<span class="token punctuation">.</span>area<span class="token punctuation">(</span>r<span class="token punctuation">)</span>\n<span class="token number">300.0</span>\n</code></pre>\n      </div>\n<h2>Interfaz de C/Python orientada a objetos a través de ctypes</h2>\n<h3>Disposición de memoria</h3>\n<p>Cuando utilizamos los <code>_fields_</code> de la estructura de ctypes tenemos que ser extremadamente cuidadosos: el orden tiene que ser el mismo que en la estructura original de C.\nEstudiando la razón detrás de esto vamos a responder también una pregunta más importante: ¿Por qué funciona lo que hicimos recién?\nPrimero que nada: una estructura de C es en realidad una manera inteligente de nombrar posiciones de memoria relativas.\nEn este caso, <code>height</code> es un <code>float</code> (o sea, que tiene 4 bytes) que está localizado 0 bytes relativo a la posición de memoria <code>Rectangle</code>.\nDe forma análoga, <code>width</code> es un <code>float</code> que está localizado a 4 bytes de la posición de memoria de <code>Rectangle</code> (ya que los primeros 4 bytes están tomados por <code>height</code>)<sup id="fnref-3"><a href="#fn-3" class="footnote-ref">3</a></sup>.\nAsí que la función de C <code>area</code> simplemente toma los primeros 4 bytes comenzando por <code>rect</code> y loss egundo 4 bytes comenzando por <code>rect</code>, interpreta los datos como <code>float</code> y los multiplica.\n¿Cómo podemos aprovechar este comportamiento desde Python?\nCuando definimos una <code>class</code> de Python heredando de una estructura de C, decimos que los primeros bytes van a estar ocupados por <code>_fields_</code>.\nCualquier otro método o atributu que agreguemos va a ser agregado a continuación.\nEn conclusión, la función <code>area</code> de C, cuando vaya a las posiciones de memoria que mencionamos recién, va a encontrar <code>height</code> y <code>width</code>, los valores que pretendíamos.\nEsto funciona, obviamente, siempre que pongamos en el mismo orden los atributos en la estructura de C y los <code>_fields_</code> en la clase de Python.</p>\n<h3>Implementación de la librería</h3>\n<p>Si modificamos la clase de Python agregando métodos o atributos nuevos, los primeros bytes van a mantenerse iguales.\nEsto significa que, para las funciones de C, agregar métodos y atributos no va a cambiar la estructira (al menos en las posiciones de memoria que estaban originalmente permitidas en la estructura de C).\nEsto es lo que vamos a usar para poder encapsular por completo la estructura de C como un objeto de Python.\nPodríamos, por ejemplo, agregar un constructor simple <code>__init__</code>.\nPero el ejemplo más interesante es agregar métodos que originalmente eran funciones de C.\nA partir de la explicación de más arriba, se vuelve claro que tiene que haber alguna forma de encapsular la función <code>area</code> de C como un método del objeto de Python.\nEl argumento que tenemos que usar para llamar la función <code>area</code> de C será la estructura en sí misma.\nAhora podemos crear una librería de Python más avanzada:</p>\n<div class="gatsby-highlight">\n      <pre class="language-python"><code><span class="token comment" spellcheck="true"># file: geometry.py</span>\n\n<span class="token keyword">import</span> ctypes <span class="token keyword">as</span> C\n\nCLIB <span class="token operator">=</span> C<span class="token punctuation">.</span>CDLL<span class="token punctuation">(</span><span class="token string">\'./libgeometry.so\'</span><span class="token punctuation">)</span>\nCLIB<span class="token punctuation">.</span>area<span class="token punctuation">.</span>argtypes <span class="token operator">=</span> <span class="token punctuation">[</span>C<span class="token punctuation">.</span>Structure<span class="token punctuation">]</span>\nCLIB<span class="token punctuation">.</span>area<span class="token punctuation">.</span>restype <span class="token operator">=</span> C<span class="token punctuation">.</span>c_float\n\n<span class="token keyword">class</span> <span class="token class-name">Rectangle</span><span class="token punctuation">(</span>C<span class="token punctuation">.</span>Structure<span class="token punctuation">)</span><span class="token punctuation">:</span>\n  _fields_ <span class="token operator">=</span> <span class="token punctuation">[</span><span class="token punctuation">(</span><span class="token string">"height"</span><span class="token punctuation">,</span> C<span class="token punctuation">.</span>c_float<span class="token punctuation">)</span><span class="token punctuation">,</span>\n              <span class="token punctuation">(</span><span class="token string">"width"</span><span class="token punctuation">,</span> C<span class="token punctuation">.</span>c_float<span class="token punctuation">)</span><span class="token punctuation">]</span>\n\n  <span class="token keyword">def</span> <span class="token function">__init__</span><span class="token punctuation">(</span>self<span class="token punctuation">,</span> height<span class="token punctuation">,</span> width<span class="token punctuation">)</span><span class="token punctuation">:</span>\n    self<span class="token punctuation">.</span>height <span class="token operator">=</span> height\n    self<span class="token punctuation">.</span>width <span class="token operator">=</span> width\n\n  <span class="token keyword">def</span> <span class="token function">area</span><span class="token punctuation">(</span>self<span class="token punctuation">)</span><span class="token punctuation">:</span>\n    <span class="token keyword">return</span> CLIB<span class="token punctuation">.</span>area<span class="token punctuation">(</span>self<span class="token punctuation">)</span>\n</code></pre>\n      </div>\n<p>¿Cómo usamos esta librería desde Python?</p>\n<div class="gatsby-highlight">\n      <pre class="language-python"><code><span class="token operator">>></span><span class="token operator">></span> <span class="token keyword">import</span> geometry\n<span class="token operator">>></span><span class="token operator">></span> r <span class="token operator">=</span> geometry<span class="token punctuation">.</span>Rectangle<span class="token punctuation">(</span><span class="token number">10</span><span class="token punctuation">,</span> <span class="token number">20</span><span class="token punctuation">)</span>\n<span class="token operator">>></span><span class="token operator">></span> r<span class="token punctuation">.</span>area<span class="token punctuation">(</span><span class="token punctuation">)</span>\n<span class="token number">200.0</span>\n<span class="token operator">>></span><span class="token operator">></span> r<span class="token punctuation">.</span>width <span class="token operator">=</span> <span class="token number">400</span>\n<span class="token operator">>></span><span class="token operator">></span> r<span class="token punctuation">.</span>area<span class="token punctuation">(</span><span class="token punctuation">)</span>\n<span class="token number">4000.0</span>\n</code></pre>\n      </div>\n<p>Y, finalmente, la estructura de C y sus funciones están completamente encapsuladas.\nPara el usuario fiunal no ahy diferencia entre esta librería y una hecha completamente en Python, pero aquí estamos ejecutando, en realidad, código de C.</p>\n<h2>Conclusiones</h2>\n<p>Pudimos encapsular completamente el comportamiento de funciones de C que actúan sobre esctructuras como métodos de un objeto de Python.\nAsí obtuvimos un código completamente orientado a objetos, que a simple vista es puramente pythonico pero, en realidad, realiza sus cálculos en C.</p>\n<div class="footnotes">\n<hr>\n<ol>\n<li id="fn-1">\n<p>Recordemos que no estamos haciendo a Python más rápido sino ejecutando, desde Python, un código de C mucho más rápido.</p>\n<a href="#fnref-1" class="footnote-backref">↩</a>\n</li>\n<li id="fn-2">\n<p>De hecho, ya que una estructura es una posición de memoria y éstas son <code>int</code>, no es <em>técnicamente</em> un requisito agregarle el <code>argtype</code> como <code>C.Structure</code>.</p>\n<a href="#fnref-2" class="footnote-backref">↩</a>\n</li>\n<li id="fn-3">\n<p>En general no podemos directamente sumar los tamaños de los elementos que compnen a una estructura, ya que la <a href="https://en.wikipedia.org/wiki/Data_structure_alignment#Typical_alignment_of_C_structs_on_x86">alineación de datos</a> es ligeramente más complicada.</p>\n<a href="#fnref-3" class="footnote-backref">↩</a>\n</li>\n<li id="fn-4">\n<p>Ya existe un constructor por defecto para la <code>Structure</code> de ctypes, que inicializa los valores de <code>_fields_</code> a los argumentos pasados en el constructor.</p>\n<a href="#fnref-4" class="footnote-backref">↩</a>\n</li>\n</ol>\n</div>',frontmatter:{title:"Interacción entre C y Python: Parte III - Uso avanzado de ctypes",date:"November 19, 2017"}}},pathContext:{slug:"/c-python-iii/"}}}});
//# sourceMappingURL=path---c-python-iii-707e9354ba20fb718440.js.map