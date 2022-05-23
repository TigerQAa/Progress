<script lang="ts">
  import { find } from "lodash-es";

  import { map } from "lodash-es";

  import randomNumber from "../functions/randomNumber";

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
      government: ""
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

  let events: { name: string; desc: string; action: () => void }[] = [
    {
      name: "Virus",
      desc: "Oh no! A virus has taken over your country. It decreases population by 10 * (random 1-6), and decreases your happiness by 5.",
      action: () => {
        country.stats.population -= 10 * randomNumber(1, 6);
        country.stats.happiness -= 5;
      }
    }
  ];

  let event = {
    name: "",
    desc: ""
  };

  let allTypesBusinesses: {
    name: string;
    money: number;
    resourcesNeeded: {
      name: string;
      amount: number;
    }[];
  }[] = [
    {
      name: "Clothing",
      resourcesNeeded: [findResource("Cotton")!, findResource("Water")!],
      money: 200
    },
    {
      name: "Farm",
      resourcesNeeded: [findResource("Crops")!, findResource("Animals")!],
      money: 400
    },
    {
      name: "Coal Plant",
      resourcesNeeded: [findResource("Rocks")!, findResource("Fossil Fuels")!],
      money: 600
    },
    {
      name: "Luxury Items",
      resourcesNeeded: [findResource("Cotton")!, findResource("Lumber")!, findResource("Spices")!],
      money: 1000
    }
  ];

  let form: HTMLDivElement = undefined as unknown as HTMLDivElement;
  let game: HTMLDivElement = undefined as unknown as HTMLDivElement;
  let end: HTMLDivElement = undefined as unknown as HTMLDivElement;
  let preWar: HTMLButtonElement = undefined as unknown as HTMLButtonElement;
  let preWar2: HTMLButtonElement = undefined as unknown as HTMLButtonElement;
  let war: HTMLDivElement = undefined as unknown as HTMLDivElement;

  let announcement = "";

  function enoughActions() {
    const enough = turn.actions >= 1;
    if (enough) turn.actions--;
    return enough;
  }

  function tradeAction() {
    if (trade.money > country.stats.money) return (announcement = "Invalid trade parameters.");

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

    if (trade.amount > 0) {
      if (trade.givenAmount > 3 || trade.amount > 3) return (announcement = "Too much traded!");
      if (trade.givenResource === "" || trade.resource === "")
        return (announcement = "No resource selected!");

      const givenResource = findResource(trade.givenResource);
      const resource = findResource(trade.resource);
      if (!resource) return (announcement = "Could not find resource! WHAT DID YOU DO!!!");
      if (resource.amount < trade.amount) return (announcement = "Too little resources.");
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
    console.log(businesses);
    country.stats.happiness += 5;
  }

  async function start() {
    form.style.display = "none";
    game.style.display = "block";
    for (const special of specialized) {
      special.amount += 1;
    }
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

    for (const special of specialized) {
      special.amount += 1;
    }

    const { name, desc, action } = events[randomNumber(0, events.length - 1)];

    event = { name, desc };
    action();

    country.stats.population < 0 ? (country.stats.population = 0) : null;
    country.stats.happiness < 0 ? (country.stats.happiness = 0) : null;
    country.stats.money < 0 ? (country.stats.money = 0) : null;
  }

  function expand() {
    if (!enough(1000)) return;
    country.stats.territory++;
  }

  let options = {
    religions: ["Christianity", "Islam", "Hinduism", "Buddhism", "Judaism"],
    governments: ["Democracy", "Theocracy", "Monarchy", "Dictatorship", "Oligarchy", "Anarchy"]
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

  function findBusinessType(name: string) {
    return allTypesBusinesses.find((v) => v.name === name);
  }

  function findBusiness(name: string) {
    return businesses.find((v) => v.name === name);
  }

  function findResource(name: string) {
    return country.resources.find((v) => v.name === name);
  }

  function upgrade(business: { name: string; money: number; start: number }) {
    if (!enough(business.start * 2)) return (announcement = "Not enough!");

    business.money += business.start * 0.5;

    businesses = businesses;
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

  let specialized = [
    country.resources[randomNumber(0, 7)],
    country.resources[randomNumber(0, 7)],
    country.resources[randomNumber(0, 7)]
  ];

  let build:
    | ""
    | {
        name: string;
        money: number;
        resourcesNeeded: {
          name: string;
          amount: number;
        }[];
      } = "";

  function create() {
    if (build === "") return (announcement = "Nothing selected!");
    console.log("e");
    console.log(build);
    if (!build.resourcesNeeded.every((v) => findResource(v.name)!.amount >= 1))
      return (announcement = "Not enough resources!");
    console.log("e");
    if (!enough(build.money)) return (announcement = "Not enough actions or money");
    console.log("e");
    build.resourcesNeeded.map((v) => (findResource(v.name)!.amount -= 1));

    businesses = [...businesses, { name: build.name, money: build.money, start: build.money }];
  }

  function fight() {
    if (!enoughActions()) return (announcement = "Not enough actions!");
    prepare();
  }

  function defend() {
    prepare();
  }

  function prepare() {
    preWar.style.display = "none";
    preWar2.style.display = "none";
    war.style.display = "block";
  }

  function win(won: boolean) {
    if (won) {
      country.stats.territory++;
    } else {
      country.stats.territory--;
    }

    war.style.display = "none";
    preWar.style.display = "block";
    preWar2.style.display = "block";
  }
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

    <select bind:value={country.traits.government} required>
      <option value="" disabled selected>Government</option>
      {#each options.governments as government}
        <option value={government}>
          {government}
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
      You are {country.traits.government === "Anarchy" ? "an" : "a"}
      {country.traits.government} that believes in {country.traits.religion}.
    </h3>
  </div>

  <div class="text-center">
    <h1 class="text-center">Turn {turn.number}</h1>
    <button on:click={nextTurn} class="text-center p-2 text-lg border m-4">Next Turn</button>
    <br />
    <h1 class="text-xl">Actions: {turn.actions}</h1>
  </div>

  <div class="float-left block border p-4 clear-right">
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

  <div class="fixed top-0 left-0 border p-4 max-w-md">
    <h1 class="text-xl">{event.name}</h1>
    <p>{event.desc}</p>
  </div>

  <div class="float-right border p-4 clear-right">
    {#each country.resources as resource}
      <p>{resource.name}: {resource.amount}.</p>
    {/each}
  </div>
  <div class="float-right border p-4">
    <h1 class="text-xl">Trade</h1>
    <br />
    <h1 class="text-xl">You</h1>
    <br />
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
      <p>Amount</p>
      <input type="text" placeholder="Amount" bind:value={trade.amount} />
      <p>Money</p>
      <input type="text" placeholder="Money" bind:value={trade.money} />
      <br />

      <h1 class="text-xl">Them</h1>
      <select bind:value={trade.givenResource}>
        <option value="" disabled selected>Resource Given</option>
        {#each country.resources as resource}
          <option value={resource.name}>
            {resource.name}
          </option>
        {/each}
      </select>
      <br />
      <p>Amount</p>
      <input type="text" placeholder="Amount Given" bind:value={trade.givenAmount} />
      <p>Money</p>
      <input type="text" placeholder="Money Given" bind:value={trade.givenMoney} />
      <br />
      <button class="border border-black p-2">Trade!</button>
    </form>
  </div>

  <div class="float-left border p-4">
    {#each businesses as business}
      <div class="block">
        <p class="inline-block">{business.name}: ${business.money} per turn.</p>
        <button class="border border-black p-2 inline-block" on:click={() => upgrade(business)}
          >Upgrade!</button
        >
      </div>
    {/each}
    <select bind:value={build}>
      <option value="" disabled selected>Business</option>
      {#each allTypesBusinesses as business}
        <option value={business}>{business.name}</option>
      {/each}
    </select>
    <button class="border border-black p-2" on:click={create}>Build!</button>
  </div>

  <div class="fixed left-1/2 bottom-5 mx-auto my-0 origin-[-50%,-50%] border p-4">
    <h1 class="text-xl">War</h1>
    <button on:click={fight} bind:this={preWar}>Go to war!</button>
    <button on:click={defend} bind:this={preWar2}>Defend!</button>
    <div bind:this={war} class="hidden">
      <p>Army: {country.stats.happiness + 0.01 * country.stats.population}</p>
      <p class="text-sm">Did you win?</p>
      <button class="border border-black p-2" on:click={() => win(true)}>Yes</button>
      <button class="border border-black p-2" on:click={() => win(false)}>No</button>
    </div>
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
  <br />
  <h1 class="text-2xl">
    Total: {0.25 * country.stats.money +
      0.5 * totalBusinesses() +
      country.stats.territory * 100 +
      country.stats.population * 0.5}
  </h1>
</div>
