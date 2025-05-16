import csv

def export_unique_values(csv_path, txt_output_path):
    with open(csv_path, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        columns = reader.fieldnames
        
        # Crear un diccionario para almacenar valores únicos de cada columna
        unique_values = {col: set() for col in columns}
        
        # Leer filas y guardar valores únicos por columna
        for row in reader:
            for col in columns:
                value = row[col].strip()
                if value:
                    unique_values[col].add(value)
        
    # Escribir el archivo txt con los valores únicos
    with open(txt_output_path, 'w', encoding='utf-8') as txtfile:
        for col in columns:
            txtfile.write(col + '\n')
            for val in sorted(unique_values[col]):
                txtfile.write(val + '\n')
            txtfile.write('\n')

if __name__ == "__main__":
    csv_path = "beaches_table.csv"        # Cambia aquí el nombre de tu CSV
    txt_output_path = "unicos.txt" # Nombre del archivo de salida
    export_unique_values(csv_path, txt_output_path)
    print(f"Archivo '{txt_output_path}' generado con valores únicos de cada columna.")
