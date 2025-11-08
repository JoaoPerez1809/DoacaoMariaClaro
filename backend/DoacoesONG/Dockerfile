# Estágio 1: Build da Aplicação
# Usamos a imagem completa do SDK do .NET para compilar o projeto
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copia os ficheiros .csproj e restaura as dependências primeiro.
# Isto aproveita o cache do Docker, acelerando builds futuros.
COPY *.csproj .
RUN dotnet restore

# Copia o resto do código-fonte e publica a aplicação para produção
COPY . .
RUN dotnet publish -c Release -o out

# Estágio 2: Imagem Final de Execução
# Usamos a imagem do ASP.NET Runtime, que é muito mais leve
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Copia apenas os ficheiros compilados do estágio de build
COPY --from=build /app/out .

# Define a porta que o contentor irá expor
EXPOSE 8080

# Define o comando para iniciar a aplicação quando o contentor for executado
ENTRYPOINT ["dotnet", "DoacoesONG.dll"] 
# (Ajuste "DoacoesONG.dll" para o nome do seu projeto .dll)