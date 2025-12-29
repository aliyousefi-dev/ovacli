package jsondb

import "ova-cli/source/internal/datatypes"

func (jsdb *JsonDB) GetGlobalFilters() ([]datatypes.GlobalFilter, error) {
	// Load all global filters from the JSON file
	filters, err := jsdb.loadGlobalFilters()
	if err != nil {
		return nil, err
	}
	return filters, nil
}
