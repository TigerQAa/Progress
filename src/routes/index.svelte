<script lang="ts">
  import { find } from "lodash-es";

  import { map } from "lodash-es";

  import randomNumber from "../functions/randomNumber";

  let form: HTMLDivElement = undefined as unknown as HTMLDivElement;
  let game: HTMLDivElement = undefined as unknown as HTMLDivElement;
  let end: HTMLDivElement = undefined as unknown as HTMLDivElement;

  let announcement = "";

  function enoughActions() {
    const enough = turn.actions >= 1;
    if (enough) turn.actions--;
    return enough;
  }

  function tradeAction() {
    if (trade.money > country.stats.money) return (announcement = "Invalid trade paramaters.");

    // if (country.resources[trade.resource] < trade.amount) return "Too little resources!";

    if (trade.amount <= 0) {
      if (trade.givenAmount <= 0) return (announcement = "Don't just trade money!");
      if (trade.givenAmount > 3) return (announcement = "Too much traded!");
      if (trade.givenResource === "") return (announcement = "No resource selected!");
      if (trade.money <= 0) return (announcement = "You cant have it for free! :(");
      const resource = findResource(trade.givenResource);
      if (!resource) return (announcement = "Could not find resource! WHAT DID YOU DO!!!");
      if (!enough(trade.money)) return (announcement = "Not enough actions or money!");

      country.stats.money -= Math.ceil(trade.money);
      country.stats.money += Math.ceil(trade.givenMoney);
      resource.amount += Math.ceil(trade.givenAmount);

      return;
    }

    if (trade.amount > 0 && trade.amount === Math.round(trade.amount)) {
      if (trade.givenAmount > 3 || trade.amount > 3) return (announcement = "Too much traded!");
      if (trade.givenResource === "" || trade.resource === "")
        return (announcement = "No resource selected!");

      const givenResource = findResource(trade.givenResource);
      const resource = findResource(trade.resource);
      if (!resource) return (announcement = "Could not find resource! WHAT DID YOU DO!!!");
      if (!enough(trade.money)) return (announcement = "Not enough actions or money!");

      country.stats.money -= Math.ceil(trade.money);
      country.stats.money += Math.ceil(trade.givenMoney);
      if (givenResource) givenResource.amount += Math.ceil(trade.givenAmount);

      resource.amount -= trade.givenAmount;

      return;
    }

    return (announcement = "Trade did not work for unknown reason!");
  }

  function enoughCash(amount: number) {
    const enough = country.stats.money >= amount;
    if (enough) country.stats.money -= amount;
    return enough;
  }

  function enough(amount: number) {
    if (country.stats.money >= amount && turn.actions >= 1) {
      enoughActions();
      enoughCash(amount);
      return true;
    }
    announcement = "Not enough actions or cash!";
    return false;
  }

  function happy() {
    if (!enough(500)) return;
    country.stats.happiness += 5;
  }

  function start() {
    form.style.display = "none";
    game.className = "";
  }

  function endGame() {
    game.style.display = "none";
    end.style.display = "block";
  }

  function nextTurn() {
    announcement = "";
    if (turn.number === 25) return endGame(); // TODO: add end function
    turn.number++;
    turn.actions = 2;

    const stats = country.stats;
    // ECONOMY
    let total = 0;

    // tax
    total += stats.population * (0.01 * stats.happiness);

    // business
    businesses.map((v) => (total += v.money));

    country.stats.money += Math.round(total);

    // POPULATION
    country.stats.population += Math.round(stats.happiness * 1.5);
    if (country.stats.population > stats.territory * 500) {
      country.stats.population = stats.territory * 500;
    }
  }

  function expand() {
    if (!enough(1000)) return;
    country.stats.territory++;
  }

  let options = {
    religions: ["Christianity", "Islam", "Hinduism", "Buddhism", "Judaism"],
    goverments: ["Democracy", "Theocracy", "Monarchy", "Dictatorship", "Oligarchy", "Anarchy"]
  };

  let country = {
    stats: {
      money: 1000,
      happiness: 60,
      population: 300,
      territory: 1
    },

    traits: {
      name: "",
      religion: "",
      goverment: ""
    },

    resources: [
      { name: "Rocks", amount: 0 },
      { name: "Crops", amount: 0 },
      { name: "Lumber", amount: 0 },
      { name: "Cotton", amount: 0 },
      { name: "Animals", amount: 0 },
      { name: "Spices", amount: 0 },
      { name: "Water", amount: 0 },
      { name: "Fossil Fuels", amount: 0 }
    ]
  };

  let turn = {
    number: 1,
    actions: 2
  };

  let businesses: { name: string; money: number; start: number }[] = [
    { name: "Air Factory", money: 100, start: 100 }
  ];

  function totalBusinesses() {
    return businesses.map((v) => v.money).reduce((acc, cur) => acc + cur);
  }

  function findResource(name: string) {
    return country.resources.find((v) => v.name === name);
  }

  let trade: {
    resource: string | "";
    amount: 0 | 1 | 2 | 3;
    money: number;
    givenResource: string | "";
    givenAmount: 0 | 1 | 2 | 3;
    givenMoney: number;
  } = {
    resource: "",
    amount: 0,
    money: 0,
    givenResource: "",
    givenAmount: 0,
    givenMoney: 0
  };
</script>

<div class="start" bind:this={form}>
  <form on:submit|preventDefault={start}>
    <input type="text" placeholder="Name" bind:value={country.traits.name} required />

    <select bind:value={country.traits.religion} required>
      <option value="" disabled selected>Religion</option>
      {#each options.religions as religion}
        <option value={religion}>
          {religion}
        </option>
      {/each}
    </select>

    <select bind:value={country.traits.goverment} required>
      <option value="" disabled selected>Goverment</option>
      {#each options.goverments as goverment}
        <option value={goverment}>
          {goverment}
        </option>
      {/each}
    </select>

    <button class="border border-black p-2">Create country!</button>
  </form>
</div>

<div class="hidden" bind:this={game}>
  <div class="text-center">
    <h1 class="text-2xl">{announcement}</h1>
    <h1 class="text-center text-6xl font-bold">{country.traits.name}</h1>
    <br />
    <h3 class="text-center text-lg font-bold">
      You are {country.traits.goverment === "Anarchy" ? "an" : "a"}
      {country.traits.goverment} that believes in {country.traits.religion}.
    </h3>
  </div>

  <div class="text-center">
    <h1 class="text-center">Turn {turn.number}</h1>
    <button on:click={nextTurn} class="text-center p-2 text-lg border m-4">Next Turn</button>
    <br />
    <h1 class="text-xl">Actions: {turn.actions}</h1>
  </div>

  <div class="float-left border p-4">
    <p>Money: ${country.stats.money}.</p>
    <p>Population: {country.stats.population} people.</p>
    <p>Happiness: {country.stats.happiness}%.</p>
    <button on:click={happy} class="text-center p-2 text-lg border m-4">Buy Happiness (500)</button>
    <p>
      Squares: {country.stats.territory}
      {country.stats.territory !== 1 ? "squares" : "square"}.
    </p>
    <button on:click={expand} class="text-center p-2 text-lg border m-4">Expand (1000)</button>
  </div>

  <div class="float-right border p-4 block">
    {#each country.resources as resource}
      <p>{resource.name}: {resource.amount}.</p>
    {/each}
  </div>
  <br />
  <div class="float-right border p-4 block">
    <h1 class="text-xl">Trade</h1>
    <form on:submit|preventDefault={tradeAction}>
      <select bind:value={trade.resource}>
        <option value="" disabled selected>Resource</option>
        {#each country.resources as resource}
          <option value={resource.name}>
            {resource.name}
          </option>
        {/each}
      </select>
      <br />
      <input type="text" placeholder="Amount" bind:value={trade.amount} />
      <br />
      <input type="text" placeholder="Money" bind:value={trade.money} />
      <br />
      <select bind:value={trade.givenResource}>
        <option value="" disabled selected>Given Resource</option>
        {#each country.resources as resource}
          <option value={resource.name}>
            {resource.name}
          </option>
        {/each}
      </select>
      <br />
      <input type="text" placeholder="Amount Given" bind:value={trade.amount} />
      <br />
      <input type="text" placeholder="Money Given" bind:value={trade.money} />
      <br />
      <button class="border border-black p-2">Trade!</button>
    </form>
  </div>
</div>

<div class="hidden" bind:this={end}>
  <h1 class="text-2xl">SCORE:</h1>
  <br />
  <h2 class="text-xl">Population: {country.stats.population * 0.5}</h2>
  <br />
  <h2 class="text-xl">Territory: {country.stats.territory * 100}</h2>
  <br />
  <h2 class="text-xl">
    Economy: {0.25 * country.stats.money + 0.5 * totalBusinesses()}
  </h2>
</div>
