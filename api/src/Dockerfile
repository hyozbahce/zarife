FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["Zarife.API/Zarife.API.csproj", "Zarife.API/"]
COPY ["Zarife.Core/Zarife.Core.csproj", "Zarife.Core/"]
COPY ["Zarife.Infrastructure/Zarife.Infrastructure.csproj", "Zarife.Infrastructure/"]
RUN dotnet restore "Zarife.API/Zarife.API.csproj"
COPY . .
WORKDIR "/src/Zarife.API"
RUN dotnet build "Zarife.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Zarife.API.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Zarife.API.dll"]
