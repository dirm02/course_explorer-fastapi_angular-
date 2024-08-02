import pandas as pd



def normalize_data(df):
    # Create unique lists for universities, cities, and countries
    universities = df['University'].drop_duplicates().reset_index(drop=True).reset_index().rename(columns={'index': 'UniversityID'})
    cities = df['City'].drop_duplicates().reset_index(drop=True).reset_index().rename(columns={'index': 'CityID'})
    countries = df['Country'].drop_duplicates().reset_index(drop=True).reset_index().rename(columns={'index': 'CountryID'})
    course_names = df['CourseName'].drop_duplicates().reset_index(drop=True).reset_index().rename(columns={'index': 'CourseID'})
    currencies = df['Currency'].drop_duplicates().reset_index(drop=True).reset_index().rename(columns={'index': 'CurrencyID'})

    # Define the categories dictionary
    categories = {
        'universities': universities,
        'cities': cities,
        'countries': countries,
        'course_names': course_names,
        'currencies': currencies
    }

    # Merge these IDs back into the main dataframe
    df = df.merge(universities, on='University').merge(cities, on='City').merge(countries, on='Country').merge(course_names, on='CourseName').merge(currencies, on='Currency')

    # Drop the text columns and rename ID columns accordingly
    df_normalized = df.drop(columns=['University', 'City', 'Country', 'Currency']).rename(columns={
        'UniversityID': 'UniversityID',
        'CityID': 'CityID',
        'CountryID': 'CountryID',
        'CourseID': 'CourseID',
        'CurrencyID': 'CurrencyID'
    })
    # print(df_normalized)

    # Reorder the columns for clarity
    df_normalized = df_normalized[['UniversityID', 'CityID', 'CountryID', 'CourseID', 'CourseDescription', 'StartDate', 'EndDate', 'Price', 'CurrencyID']]

    return df_normalized, categories

# Example usage:
if __name__ == '__main__':
    # Load the CSV file
    file_path = 'UniversitySchema.csv'
    df = pd.read_csv(file_path)
    df_normalized, categories = normalize_data(df)
    # Display the normalized dataframes
    print(df_normalized)

    print(categories['universities'])
    print(categories['cities'])
