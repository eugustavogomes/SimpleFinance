FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY SimpleFinance.Api.csproj .
RUN dotnet restore SimpleFinance.Api.csproj
COPY . .
RUN dotnet publish SimpleFinance.Api.csproj -c Release -o /app/out

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/out .
ENTRYPOINT ["dotnet", "SimpleFinance.Api.dll"]
