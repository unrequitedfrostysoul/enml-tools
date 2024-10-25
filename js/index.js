(function () {
    const $div_menu = document.getElementById("menu");
    const $div_templates = document.getElementById("templates");
    const $div_viewer = document.getElementById("viewer");
    const $form_enml_files = document.getElementById("enml-files");
    const $counters = {};
    const $loop_parameters = {};
    let $files, $curr_div_items;
    let $names_list = "";
    function $clear_children($_el) {
        [...$_el.children].forEach(($_child) => $_child.remove());
    }
    function $key_query($_el, $_key) {
        return $_el.querySelector(`[data-key="${$_key}"]`);
    }
    function $get_template($_key) {
        return $key_query($div_templates, $_key).content.cloneNode(true);
    };
    function $file_loop($_obj) {
        const $file = $files[$counters[$_obj.$_counter_key]];
        let $fr;
        if (!$file) return;
        if ($_obj.$_file_handler) $_obj.$_file_handler($file);
        $fr = new FileReader();
        $fr.addEventListener("load", $_obj.$_load_function);
        $fr.readAsText($file);
        $counters[$_obj.$_counter_key]++;
    }
    function $download_list_file() {
        const $a_download = document.createElement("a");
        const $blob = new Blob([$names_list], { type: "text/plain", endings: "native" });
        const $urlobj = URL.createObjectURL($blob);
        const $filename = prompt("Insira o nome para o aquivo LIST (sem extensão):");
        $a_download.download = `${$filename}.list`;
        $a_download.href = $urlobj;
        $a_download.click();
    }
    function $search_name($_item) {
        const $split = $_item.split("name = ");
        const $semicolon_pos = $split[1].search(";");
        return `${$split[1].slice(0, $semicolon_pos)}\n`;
    }
    function $get_names($_enml) {
        const $items = $_enml.split("{");
        let $names = "";
        $items.shift();
        $items.forEach(($_item) => $names += $search_name($_item));
        return $names;
    }
    function $append_names($_ev) {
        $names_list += $get_names($_ev.target.result);
        $file_loop($loop_parameters["append"]);
    }
    function $configure_row($_properties, $_key) {
        const $frg_row = $get_template("row");
        $key_query($frg_row, "th").textContent = $_key;
        $key_query($frg_row, "td").textContent = $_properties[$_key];
        return $frg_row;
    }
    function $generate_rows($_properties) {
        const $rows = [];
        const $keys = Object.keys($_properties);
        $keys.forEach(($_key) => $rows.push($configure_row($_properties, $_key)));
        return $rows;
    }
    function $declare_property($_enml, $_obj) {
        const $split = $_enml.split("=");
        const $key = $split[0].trim();
        const $value = $split[1].trim();
        $_obj[$key] = $value;
    }
    function $get_enml_properties($_enml) {
        const $obj = {};
        const $declare = ($_declaration) => $declare_property($_declaration, $obj);
        $_enml.forEach($declare);
        return $obj;
    }
    function $process_properties($_item) {
        const $properties_enml = $_item.split(";");
        $properties_enml.pop();
        return $get_enml_properties($properties_enml);
    }
    function $generate_div_items($_file) {
        const $frg_container = $get_template("container");
        const $div_container = $frg_container.firstElementChild;
        const $div_items = $get_template("div-items").firstElementChild;
        $key_query($frg_container, "h3").textContent += $_file.name;
        $div_container.append($div_items);
        $div_viewer.append($frg_container);
        return $div_items;
    }
    function $generate_tables($_item) {
        const $properties = $process_properties($_item);
        const $frg_table = $get_template("viewer-table");
        const $table = $frg_table.firstElementChild;
        const $rows = $generate_rows($properties);
        $curr_div_items.append($frg_table);
        $table.createTBody().append(...$rows);
    }
    function $generate_items($_ev) {
        const $items = $_ev.target.result.split("{");
        $items.shift();
        $items.forEach($generate_tables);
        $file_loop($loop_parameters["read"]);
    }
    function $process_files() {
        const $frag_menu = $get_template("menu");
        const $button_export = $key_query($frag_menu, "export");
        $files = [...$key_query($form_enml_files, "files").files];
        $button_export.addEventListener("click", $download_list_file);
        $clear_children($div_viewer);
        $clear_children($div_menu);
        $div_menu.append($frag_menu);
        $names_list = "";
        $counters["read"] = 0;
        $counters["append"] = 0;
        $file_loop($loop_parameters["read"]);
        $file_loop($loop_parameters["append"]);
    }
    $counters["read"] = 0;
    $counters["append"] = 0;
    $loop_parameters["read"] = {
        $_counter_key: "read",
        $_load_function: $generate_items,
        $_file_handler: ($_file) => $curr_div_items = $generate_div_items($_file)
    };
    $loop_parameters["append"] = {
        $_counter_key: "append",
        $_load_function: $append_names
    };
    $form_enml_files.addEventListener("change", $process_files);
})();